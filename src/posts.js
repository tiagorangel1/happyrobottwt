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

    return {
      author: {
        name: post.user.name,
        username: post.user.screen_name,
      },
      content: post.text,
      thread_parent: post.parent ? parse(post.parent) : null,
      quoting: post.quoted_tweet ? parse(post.quoted_tweet) : null,
    };
  };

  return { post: parse(results), media };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const postId = prompt("post id:", "1933854888431059126").trim();

    if (!postId) process.exit();

    console.log("");
    console.log(JSON.stringify(await parsePost(postId)));
  })();
}

export default parsePost;
