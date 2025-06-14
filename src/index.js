import fs from "fs/promises";

import readNotifications from "./notifications.js";
import parsePost from "./posts.js";
import composePost from "./composer.js";
import generateReply from "./llm.js";

(async () => {
  const res = await fetch("https://pro.x.com/", {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "cache-control": "no-cache",
      pragma: "no-cache",
      cookie: `auth_token=${process.env.TWITTER_AUTH_TOKEN};`,
    },
  });

  const csrfToken = res.headers
    .get("set-cookie")
    .split(", ct0=")[1]
    .split(";")[0];
  const cookies = `auth_token=${process.env.TWITTER_AUTH_TOKEN}; ct0=${csrfToken};`;

  console.log("[auth] logged in");

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

      const text = await generateReply(await parsePost(postId));

      await Bun.sleep(Math.random() * 2000);

      await composePost({
        text,
        postId,
        cookies,
        csrfToken,
      });
    });
  }, 16_000);
})();
