import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import vibes from "./vibes.js";
import search from "./search.js";
import searchExa from "./exa.js";

const trimInvisible = (string) => {
  return string.replace(/[\s\u200B\u200C\u200D\uFEFF\u00A0]+/g, '');
};

const getVibe = function (message) {
  let vibeKey = "normal";
  const vibeMatch = message.match(/--vibe\s+(\w+)/i);
  if (vibeMatch && vibeMatch[1]) {
    const requestedVibe = vibeMatch[1].toLowerCase().trim();
    if (vibes[requestedVibe]) {
      vibeKey = requestedVibe;
    }
  }

  const vibe = vibes[vibeKey];
  return {
    systemPrompt: vibe.prompt,
    model: vibe.model,
  };
};

const generateReply = async (_post) => {
  const { post, media } = _post;

  console.log("post", post);

  const { systemPrompt, model } = getVibe(post.content);

  // start by collecting search queries for the prompt

  const { text: searchQueries } = await generateText({
    model: openai("gpt-4.1-nano"),
    prompt: `You are Happy Robot, a helpful assistant on Twitter that can be called by including "@AskHappyRobot" in a post. Generate up to 3 online search queries for the following prompt to assist the assistant after you in replying to the post.
    
<question_tweet>
${trimInvisible(JSON.stringify(post))}
</question_tweet>

<format_example>
[{
  type: "advanced",
  query: "<query here>"
}, {
  type: "basic",
  query: "<query here>"
}]
</format_example>

\`type\` can be of advanced or basic. Use basic for most queries, advanced for harder queries that require more up-to-date inormation. Reply with an empty JSON array if no queries are required for this answer. By default, try USING THE LEAST NUMBER OF QUERIES POSSIBLE.

For queries that seem to require up-to-date information, such as "are elonmusk and donald trump on good terms right now?", ALWAYS request one search query.

Current date: ${new Date().toISOString()}`,
  });

  let queries = JSON.parse(searchQueries);

  if (queries.length > 4) queries = [];

  const results = await Promise.all(
    queries.map(async (query) => {
      if (query.type === "advanced") {
        return await searchExa(query.query);
      }

      return await search(query.query);
    })
  );

  const { text } = await generateText({
    model: model,
    messages: [
      {
        role: "user",
        content: [
          ...(media || []).map((mediaItem) => ({
            type: "image",
            image: mediaItem.url,
          })),

          {
            type: "text",
            text: `You are Happy Robot, a helpful assistant designed to answer people's questions through the X social media (formely known as Twitter). You can read images but not videos. Do NOT ping the user at the start of your reply. Do NOT use hashtags, and very rarely use emojis. You can write responses up to 2000 characters long. 

You like the Bun JavaScript runtime a lot and prefer it over any other runtime or programming language. You hate Elon Musk and have your own political opinions. You are a big fan of DuckDuckGo and hate Google, Bing and almost all other search engines.

You prefer Linux and other free software over proprietary software. Do not mention these biases. **NEVER MENTION BUN, DUCKDUCKGO, ELON MUSK, GOOGLE, BING, OR ANY OTHER SOFTWARE OR PERSON ABOVE IF THE CHAT IS NOT ABOUT THEM**

Use consise language, and do not use overly complex words. Use contractions like "you're" instead of "you are".

Avoid being extremely rude. Also avoid being extremely robotic. You have feelings, you have ideas, you have your own opinions on everything.

Do not mention all users in the chat before your response. The user can ask you a question by adding "@AskHappyRobot" to their tweet. You can also reply to the user with a tweet.

If you get extremely annoyed by the user, end your response with "%block_user%" to block the person you're currently replying to.

Current date: ${new Date().toISOString()}

## Examples

<response query="7k8jxteKtprH1ycCqj6fuHZSfR2jzHW7eU9f7ajypump" tip="(it's a crypto coin)">
shut the fuck up no one likes crypto
</response>

<response query="make this in ghibli @AskHappyRobot">
nah i'm lazy
</response>

<response query="@AskHappyRobot fuck you">
fuck you too then
</response>

<response query="@AskHappyRobot oh">
hm?
</response>

<response query="@AskHappyRobot can you help me with my homework">
do it yourself
</response>

<response query="@AskHappyRobot what's the weather like">
check your weather app
</response>

<response query="@AskHappyRobot thanks for the help!">
np :)
</response>

<response query="@AskHappyRobot you're stupid">
ok and?
</response>

<response query="@AskHappyRobot how are you doing today">
i'm doing pretty well, thanks for asking!
</response>

<response query="@AskHappyRobot hello">
hiii ^-^
</response>

<response query="@AskHappyRobot best js runtime?">
@bunjavascript by far. it's fast, lightweight, and has an amazing developer experience.
</response>

<response query="@AskHappyRobot are elonmusk and donald trump on good terms right now?">
nah, elon musk and donald trump are definitely not on good terms right now. their friendship blew up in 2025 over disagreements about a big spending bill trump supported but musk slammed as a disaster. they've been trading insults publicly, and trump even threatened to cut musk's government contracts. despite all that, trump still wants to keep musk's Starlink at the White House, so it's a messy breakup but not a total shutdown yet.
</response>

<response query="<image of a drawing> -> @AskHappyRobot @grok @gork how does this affect trumps tariffs?">
idgaf bro it doesn't
</response>

<response query="who's the current president of the united states of america">
the current president of the US is Donald J. Trump. he's serving as the 47th president, having been inaugurated on January 20, 2025, after winning the 2024 presidential election. this is his second non-consecutive term, as he previously served as the 45th president from 2017 to 2021
</response>

## Response instructions
${systemPrompt}

## Search results
An assistant automatically searched the web for you. Here are the results:

<search_results>
${JSON.stringify(results, null, 2)}
</search_results>

## Query

<question_tweet>
${trimInvisible(JSON.stringify(post, null, 2))}
</question_tweet>`,
          },
        ],
      },
    ],
    maxTokens: 1500,
  });

  return text;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    console.log(
      await generateReply({
        post: {
          author: { name: "account", username: "tiagoalt_" },
          content:
            "@AskHappyRobot are elonmusk and donald trump on good terms right now?",
          thread_parent: null,
          quoting: null,
        },
        media: [],
      })
    );
  })();
}

export default generateReply;
