const parsePost = async function (postId) {
  const results = await (
    await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${postId}&lang=en&token=${Math.random()
        .toString()
        .replace("0.", "")}`
    )
  ).json();

  let media = [];

  const parse = (post) => {
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

    if (post.tombstone?.text) {
      return {
        text: "This Post was deleted by the Post author.",
      };
    }

    if (
      Array.isArray(post.display_text_range) &&
      post.display_text_range.length === 2 &&
      typeof post.text === "string"
    ) {
      const [start, end] = post.display_text_range;
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      const graphemes = Array.from(
        segmenter.segment(post.text),
        (s) => s.segment
      );

      post.text = graphemes.slice(start, end).join("").trim();
      post.display_text_range = [0, post.text.length];
    }

    return {
      author: {
        name: post.user.name,
        username: post.user.screen_name,
      },
      content: post.text,
      replying_to: post.parent ? parse(post.parent) : null,
      quoting: post.quoted_tweet ? parse(post.quoted_tweet) : null,
    };
  };

  return { post: parse(results), media };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const postId = prompt("post id:", "1943607895578337418").trim();

    if (!postId) process.exit();

    console.log("");
    console.log(JSON.stringify(await parsePost(postId)));
  })();
}

export default parsePost;
