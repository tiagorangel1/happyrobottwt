import { JSDOM } from "jsdom";

const search = async function search(query) {
  const html = await (
    await fetch(`https://mojeek.com/search?q=${query}`, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (compatible; happy-crawler/1.0; +https://rentry.co/obzbp2xr)",
      },
    })
  ).text();

  const dom = new JSDOM(html);
  const { document } = dom.window;

  const result = {
    infobox: null,
    searchResults: [],
    newsResults: [],
  };

  let infoboxElement =
    document.querySelector(".infobox.infobox-top") ||
    document.querySelector(".infobox.infobox-right.js-infobox");

  if (infoboxElement) {
    const infoboxTitle =
      infoboxElement.querySelector("h1")?.textContent.trim() || "";
    let infoboxDescriptionParts = [];
    let infoboxSource = null;

    infoboxElement.querySelectorAll("p").forEach((p) => {
      if (!p.querySelector("small")) {
        infoboxDescriptionParts.push(p.textContent.trim());
      }
    });
    const infoboxDescription = infoboxDescriptionParts.join("\n").trim();

    const sourceLink = infoboxElement.querySelector("p small a");
    if (sourceLink) {
      infoboxSource = {
        text: sourceLink.textContent.trim(),
        url: sourceLink.href,
      };
    }

    result.infobox = {
      title: infoboxTitle,
      description: infoboxDescription,
      source: infoboxSource,
    };
  }

  const standardResults = document.querySelectorAll("ul.results-standard > li");
  standardResults.forEach((li) => {
    const titleElement = li.querySelector("h2 a.title");
    const urlElement = li.querySelector("a.ob");
    const snippetElement = li.querySelector("p.s");

    if (titleElement && urlElement) {
      result.searchResults.push({
        title: titleElement.textContent.trim(),
        url: urlElement.href,
        snippet: snippetElement ? snippetElement.textContent.trim() : "",
      });
    }
  });

  const newsResults = document.querySelectorAll(".news-results ul li");
  newsResults.forEach((li) => {
    const titleUrlElement = li.querySelector("a.ob");
    const sourceDateElement = li.querySelector("span");

    if (titleUrlElement && sourceDateElement) {
      result.newsResults.push({
        title: titleUrlElement.textContent.trim(),
        url: titleUrlElement.href,
        source_date: sourceDateElement.textContent.trim(),
      });
    }
  });

  return result;
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
