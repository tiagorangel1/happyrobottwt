const search = async function search(query) {
  const { results } = await (
    await fetch("https://exa.ai/search/api/search", {
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (compatible; happy-crawler/1.0; +https://rentry.co/obzbp2xr)",
      },
      method: "POST",
      body: JSON.stringify({
        numResults: 8,
        domainFilterType: "include",
        type: "auto",
        text: "true",
        density: "contents",
        query,
        useAutoprompt: false,
        moderation: true,
      }),
    })
  ).json();

  return results.map((result) => {
    return {
      url: result.url,
      title: result.title,
      date: result.publishedDate,
      summary: result.summary,
    };
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const query = prompt(
      "query:",
      "current president of the United States 2025"
    ).trim();

    if (!query) process.exit();

    console.log("");
    console.log(JSON.stringify(await search(query), null, 2));
  })();
}

export default search;
