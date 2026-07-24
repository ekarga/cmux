const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = __dirname;
const outputRoot = path.join(projectRoot, "dist");
const canonicalOrigin = "https://www.azizalbahar.com";

function read(name) {
  return fs.readFileSync(path.join(projectRoot, name), "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

function loadArticles() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("content.js"), sandbox, { filename: "content.js" });
  return sandbox.window.ARTICLES;
}

function cleanText(value) {
  return String(value).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function articleUrl(article) {
  return `/writing/${article.slug}/`;
}

function makeHomeRows(articles) {
  return articles
    .filter((article) => article.slug !== "the-last-ten-percent")
    .map(
      (article, index) => `
          <a class="article-row" href="${articleUrl(article)}">
            <span class="article-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="article-row-meta">
              <strong>${escapeHtml(article.category)}</strong>
              <time datetime="${escapeHtml(article.date)}">${escapeHtml(article.displayDate)}</time>
              <span>${escapeHtml(article.readTime)} read</span>
            </span>
            <span class="article-row-copy">
              <h3>${escapeHtml(article.title)}</h3>
              <p>${escapeHtml(article.excerpt)}</p>
            </span>
            <span class="article-arrow" aria-hidden="true">↗</span>
          </a>`,
    )
    .join("");
}

function makeToc(body) {
  return [...body.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)]
    .map((match) => `<a href="#${escapeHtml(match[1])}">${escapeHtml(cleanText(match[2]))}</a>`)
    .join("");
}

function makeArticleMarkup(article, articles) {
  const currentIndex = articles.findIndex((item) => item.slug === article.slug);
  const related = [
    articles[(currentIndex + 1) % articles.length],
    articles[(currentIndex + 2) % articles.length],
  ];

  return `
      <article>
        <header class="article-hero">
          <div class="article-hero-inner">
            <a class="article-breadcrumb" href="/#writing"><span aria-hidden="true">←</span> Back to the notebook</a>
            <p class="article-kicker">
              <span>${escapeHtml(article.category)}</span>
              <time datetime="${escapeHtml(article.date)}">${escapeHtml(article.displayDate)}</time>
              <span>${escapeHtml(article.readTime)} read</span>
            </p>
            <h1>${escapeHtml(article.title)}</h1>
            <p class="article-dek">${escapeHtml(article.excerpt)}</p>
            <div class="article-byline">
              <span class="byline-mark" aria-hidden="true">A/</span>
              <div><strong>Aziz Albahar</strong><span>iOS / macOS engineer</span></div>
            </div>
          </div>
        </header>

        <div class="article-layout">
          <aside class="article-toc" aria-label="Table of contents">
            <span>In this note</span>
            <nav id="article-toc-nav">${makeToc(article.body)}</nav>
          </aside>
          <div class="article-prose">${article.body}<span class="article-endmark" aria-label="End of article">A/</span></div>
          <aside class="article-share" aria-label="Share article">
            <span>Share</span>
            <button class="copy-button" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>
              <span>Copy link</span>
            </button>
          </aside>
        </div>
      </article>

      <section class="more-writing">
        <div class="shell">
          <div class="more-writing-heading">
            <h2>Keep reading</h2>
            <a href="/#writing">View every note ↗</a>
          </div>
          <div class="more-grid">
            ${related
              .map(
                (item) => `
                  <a class="more-card" href="${articleUrl(item)}">
                    <span>${escapeHtml(item.category)} · ${escapeHtml(item.readTime)}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.excerpt)}</p>
                  </a>`,
              )
              .join("")}
          </div>
        </div>
      </section>`;
}

function makeArticleHead(article) {
  const url = `${canonicalOrigin}/writing/${article.slug}/`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    mainEntityOfPage: url,
    author: { "@type": "Person", name: "Aziz Albahar", url: canonicalOrigin },
  }).replaceAll("<", "\\u003c");

  return `
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(article.title)}" />
    <meta property="og:description" content="${escapeHtml(article.excerpt)}" />
    <meta property="og:url" content="${url}" />
    <meta property="article:published_time" content="${article.date}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json" data-article-schema="true">${schema}</script>`;
}

function makeFeed(articles) {
  const items = articles
    .map(
      (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${canonicalOrigin}/writing/${article.slug}/</link>
      <guid isPermaLink="true">${canonicalOrigin}/writing/${article.slug}/</guid>
      <pubDate>${new Date(`${article.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(article.excerpt)}</description>
      <category>${escapeXml(article.category)}</category>
    </item>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Aziz Albahar — Notes on software craft</title>
    <link>${canonicalOrigin}</link>
    <description>Thoughts on native apps, developer tools, and making software feel obvious.</description>
    <language>en-us</language>${items}
  </channel>
</rss>
`;
}

function makeSitemap(articles) {
  const entries = [
    { url: `${canonicalOrigin}/`, date: articles[0].date },
    ...articles.map((article) => ({
      url: `${canonicalOrigin}/writing/${article.slug}/`,
      date: article.date,
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.date}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

function rootAssets(html) {
  return html
    .replace('href="favicon.svg"', 'href="/favicon.svg"')
    .replace('href="styles.css"', 'href="/styles.css"')
    .replace('src="content.js"', 'src="/content.js"')
    .replace('src="app.js"', 'src="/app.js"');
}

function write(relativePath, content) {
  const destination = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content);
}

function build() {
  const articles = loadArticles();
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  let home = read("index.html")
    .replace("<html lang=\"en\">", '<html lang="en" data-pretty-urls="true">')
    .replace(
      '<div id="article-list" class="article-list" aria-live="polite"></div>',
      `<div id="article-list" class="article-list" aria-live="polite">${makeHomeRows(articles)}</div>`,
    )
    .replaceAll(/article\.html\?slug=([a-z0-9-]+)/g, "/writing/$1/")
    .replace("</head>", `    <link rel="canonical" href="${canonicalOrigin}/" />\n    <link rel="alternate" type="application/rss+xml" title="Aziz Albahar — Writing" href="/feed.xml" />\n  </head>`);
  write("index.html", rootAssets(home));

  const articleTemplate = read("article.html");
  for (const article of articles) {
    let page = articleTemplate
      .replace("<html lang=\"en\">", '<html lang="en" data-pretty-urls="true">')
      .replace('<body data-page="article">', `<body data-page="article" data-slug="${escapeHtml(article.slug)}">`)
      .replace("<title>Writing — Aziz Albahar</title>", `<title>${escapeHtml(article.title)} — Aziz Albahar</title>`)
      .replace('content="An essay by Aziz Albahar."', `content="${escapeHtml(article.excerpt)}"`)
      .replace("  </head>", `${makeArticleHead(article)}\n  </head>`)
      .replace('<div id="article-root"></div>', `<div id="article-root">${makeArticleMarkup(article, articles)}</div>`)
      .replaceAll('href="index.html', 'href="/');
    write(`writing/${article.slug}/index.html`, rootAssets(page));
  }

  for (const asset of ["styles.css", "app.js", "content.js", "favicon.svg"]) {
    fs.copyFileSync(path.join(projectRoot, asset), path.join(outputRoot, asset));
  }

  write("feed.xml", makeFeed(articles));
  write("sitemap.xml", makeSitemap(articles));
  write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${canonicalOrigin}/sitemap.xml\n`);

  console.log(`Built ${articles.length} stories in ${path.relative(process.cwd(), outputRoot) || "dist"}.`);
}

build();
