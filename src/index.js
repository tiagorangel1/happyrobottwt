import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import fs from "fs/promises";

import fetchNotifs from "./utils/fetchNotifs.js";
import sendPost from "./utils/sendPost.js";

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
    try {
      const notifs = await fetchNotifs({
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
                text: `You are Happy Robot, a helpful assistant designed to answer people's questions through the X social media (also known as Twitter). You can not read videos yet. Answer the user's question. Do NOT ping the user at the start of your reply. Do NOT use hashtags, and very rarely use emojis. Make sure your reply is under 200 characters.

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
          model: openai("gpt-4.1-mini"),
          messages: messages,
          maxTokens: 200,
        });

        await Bun.sleep(Math.random() * 200);

        await sendPost({
          text,
          postId,
          cookies,
          csrfToken,
        });
      });
    } catch {
      console.error("Error fetching mentions:", error);
    }
  }, 16000);
})();
