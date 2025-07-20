# happy robot for twitter

a small yet quite smart twitter ai bot. it's very happy too
it can search the web now too.

**requirements:**

* bun
* twitter auth token
* openai API key

***

**usage:**

1. get a vps or any server that can run bun
2. clone the repo and install bun
3. create a `.data` folder
4. set up your `.env` with this:

```
TWITTER_AUTH_TOKEN=...
OPENAI_API_KEY=...
```

the `TWITTER_AUTH_TOKEN` is your twitter session cookie.

5. run the bot with `bun run start`.
if you want it to run forever, use a process manager like `pm2` or `forever`.

***

to install dependencies:

```bash
bun install
```

to run:

```bash
bun run start
```

this project was created using `bun init` in bun. [bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
