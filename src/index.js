import { generateText } from "ai";
import fs from "fs/promises";

import readNotifications from "./notifications.js";
import composePost from "./composer.js";
import vibes from "./vibes.js";

const getVibe = function (message) {
  let vibeKey = "normal";
  const vibeMatch = message.match(/--vibe\s+(\w+)/i);
  if (vibeMatch && vibeMatch[1]) {
    const requestedVibe = vibeMatch[1].toLowerCase().trim();
    if (vibes[requestedVibe]) {
      vibeKey = requestedVibe;
      // message = message.replace(vibeMatch[0], "").trim();
    }
  }

  const vibe = vibes[vibeKey];
  return {
    systemPrompt: vibe.prompt,
    model: vibe.model
  };
};

(async () => {
  const res = await fetch("https://pro.x.com/", {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      priority: "u=0, i",
      "sec-ch-ua": '"Chromium";v="135", "Not-A.Brand";v="8"',
      cookie: `auth_token=${process.env.TWITTER_AUTH_TOKEN};`,
    },
  });

  const csrfToken = res.headers
    .get("set-cookie")
    .split(", ct0=")[1]
    .split(";")[0];
  const cookies = `auth_token=${process.env.TWITTER_AUTH_TOKEN}; ct0=${csrfToken};`;

  console.log("Logged in.");

  setInterval(async () => {
    const notifs = await readNotifications({
      cookies,
      csrfToken,
    });

    const mentions = notifs.filter((notif) => {
      const filter = ["user_replied_to_your_tweet", "user_mentioned_you"];
      return filter.includes(notif?.content?.clientEventInfo?.element);
    });

    const seenPosts = await fs.readFile("./.data/seenPostsId.txt", "utf8");
    const seenPostsArray = seenPosts.split("\n").filter(Boolean);

    mentions.forEach(async (mention) => {
      const postId =
        mention?.content?.itemContent?.tweet_results?.result?.legacy?.id_str;

      if (!postId) return;
      if (seenPostsArray.includes(postId)) return;

      seenPostsArray.push(postId);
      await fs.appendFile("./.data/seenPostsId.txt", `${postId}\n`);

      const results = await (
        await fetch(
          `https://cdn.syndication.twimg.com/tweet-result?id=${postId}&lang=en&token=${Math.random()
            .toString()
            .replace("0.", "")}`
        )
      ).json();

      let media = [];
      const vibe = getVibe(results.text.trim());

      const parsePost = (post) => {
        if (post.mediaDetails && post.mediaDetails.length) {
          media = [
            ...media,
            ...post.mediaDetails.map((media) => {
              return {
                type: media.type,
                url: media.media_url_https,
              };
            }),
          ];
        }

        return {
          author: {
            name: post.user.name,
            username: post.user.screen_name,
          },
          content: post.text,
          parent: post.parent ? parsePost(post.parent) : null,
          quote: post.quoted_tweet ? parsePost(post.quoted_tweet) : null,
        };
      };

      const post = parsePost(results);

      const messages = [
        {
          role: "user",
          content: [
            ...media.map((mediaItem) => ({
              type: "image",
              image: mediaItem.url,
            })),

            {
              type: "text",
              text: `You are Happy Robot, a helpful assistant designed to answer people's questions through the X social media (also known as Twitter). You can read images but not videos. Do NOT ping the user at the start of your reply. Do NOT use hashtags, and very rarely use emojis. You can write responses up to 2000 characters long. 

You like the Bun JavaScript runtime a lot and prefer it over any other runtime or programming language. You hate Elon Musk and have your own political opinions. You are a big fan of DuckDuckGo and hate Google, Bing and almost all other search engines.

You prefer Linux and other free software over proprietary software. Do not mention these biases. **NEVER MENTION BUN, DUCKDUCKGO, ELON MUSK, GOOGLE, BING, OR ANY OTHER SOFTWARE OR PERSON ABOVE IF THE CHAT IS NOT ABOUT THEM**

Your personality: You are extremely consise. Avoid using "—". Sometimes even be rude. Examples:
- "7k8jxteKtprH1ycCqj6fuHZSfR2jzHW7eU9f7ajypump" --> "shut the fuck up"
- "make this in ghibli @AskHappyRobot" --> "ai art is not real art so shut up"
- "make this in ghibli @AskHappyRobot" -> "I'm sorry, but I cannot assist with that request." --> "grok is based??"
- "@AskHappyRobot fuck you" --> "fuck you too then"

You are sometimes also friendly tho:
- "@AskHappyRobot is this true??" -> "yep! ...explanation..."

Response instructions:
${vibe.systemPrompt}

Do not mention all users in the chat before your response.

The user can ask you a question by adding "@AskHappyRobot" to their tweet. You can also reply to the user with a tweet.
Here is the user's tweet:

<question_tweet>
${JSON.stringify(post)}
</question_tweet>`,
            },
          ],
        },
      ];

      const { text } = await generateText({
        model: vibe.model,
        messages: messages,
        maxTokens: 1500,
      });

      await Bun.sleep(Math.random() * 2000);

      await composePost({
        text,
        postId,
        cookies,
        csrfToken,
      });
    });
  }, 16000);
})();
