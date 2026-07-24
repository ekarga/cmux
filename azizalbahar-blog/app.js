(() => {
  const articles = Array.isArray(window.ARTICLES) ? window.ARTICLES : [];
  const featuredSlug = "the-last-ten-percent";
  const isHome = document.body.dataset.page === "home";
  const isArticle = document.body.dataset.page === "article";

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const articleUrl = (article) =>
    document.documentElement.dataset.prettyUrls === "true"
      ? `/writing/${encodeURIComponent(article.slug)}/`
      : `article.html?slug=${encodeURIComponent(article.slug)}`;

  function setupTheme() {
    const button = document.querySelector(".theme-toggle");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!button) return;

    const updateButton = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      button.setAttribute("aria-pressed", String(dark));
      themeMeta?.setAttribute("content", dark ? "#11140f" : "#f3f0e8");
    };

    updateButton();
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("aziz-theme", next);
      updateButton();
    });
  }

  function setupMobileMenu() {
    const button = document.querySelector(".menu-button");
    const menu = document.querySelector(".mobile-menu");
    if (!button || !menu) return;

    const close = () => {
      button.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    };

    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) close();
    });
  }

  function setupScrollUI() {
    const header = document.querySelector(".site-header");
    const progress = document.querySelector(".reading-progress span");

    const update = () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 8);
      if (!progress) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progress.style.width = `${percent * 100}%`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    document.querySelectorAll(".back-to-top").forEach((button) => {
      button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    });
  }

  function setupReveal() {
    const revealItems = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!revealItems.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
      observer.observe(item);
    });
  }

  function renderHomeArticles(filter = "All") {
    const list = document.querySelector("#article-list");
    const count = document.querySelector("#article-count");
    const empty = document.querySelector("#empty-state");
    if (!list) return;

    const homeArticles = articles.filter((article) => article.slug !== featuredSlug);
    const visible =
      filter === "All" ? homeArticles : homeArticles.filter((article) => article.category === filter);

    list.innerHTML = visible
      .map(
        (article, index) => `
          <a class="article-row reveal" href="${articleUrl(article)}">
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
          </a>
        `,
      )
      .join("");

    if (count) count.textContent = `${visible.length} ${visible.length === 1 ? "note" : "notes"}`;
    if (empty) empty.hidden = visible.length !== 0;
    setupReveal();
  }

  function setupFilters() {
    const chips = document.querySelectorAll(".filter-chip");
    if (!chips.length) return;

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((item) => {
          item.classList.remove("is-active");
          item.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        renderHomeArticles(chip.dataset.filter || "All");
      });
      chip.setAttribute("aria-pressed", String(chip.classList.contains("is-active")));
    });
  }

  function setupSearch() {
    const dialog = document.querySelector(".search-dialog");
    const input = document.querySelector("#search-input");
    const results = document.querySelector("#search-results");
    const closeButton = document.querySelector(".search-close");
    const triggers = document.querySelectorAll(".search-trigger");
    if (!(dialog instanceof HTMLDialogElement) || !input || !results) return;

    const renderResults = (query = "") => {
      const normalized = query.trim().toLowerCase();
      const matches = articles.filter((article) => {
        if (!normalized) return true;
        const haystack = [
          article.title,
          article.category,
          article.excerpt,
          ...(article.keywords || []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized);
      });

      results.innerHTML = matches.length
        ? matches
            .map(
              (article) => `
                <a class="search-result" href="${articleUrl(article)}">
                  <span>
                    <strong>${escapeHtml(article.title)}</strong>
                    <span>${escapeHtml(article.category)} · ${escapeHtml(article.readTime)} read</span>
                  </span>
                  <i aria-hidden="true">↗</i>
                </a>
              `,
            )
            .join("")
        : '<p class="search-empty">Nothing in the notebook matches that search.</p>';
    };

    const open = () => {
      renderResults("");
      input.value = "";
      if (!dialog.open) dialog.showModal();
      window.setTimeout(() => input.focus(), 20);
    };

    triggers.forEach((trigger) => trigger.addEventListener("click", open));
    closeButton?.addEventListener("click", () => dialog.close());
    input.addEventListener("input", () => renderResults(input.value));

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    document.addEventListener("keydown", (event) => {
      const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!shortcut) return;
      event.preventDefault();
      dialog.open ? dialog.close() : open();
    });
  }

  function renderArticle() {
    const root = document.querySelector("#article-root");
    if (!root) return;

    const slug =
      document.body.dataset.slug ||
      new URLSearchParams(window.location.search).get("slug") ||
      featuredSlug;
    const article = articles.find((item) => item.slug === slug);
    if (!article) {
      root.innerHTML = `
        <section class="article-not-found">
          <div>
            <p class="eyebrow">404 / LOST NOTE</p>
            <h1>This page slipped out of the notebook.</h1>
            <p>The story may have moved, or the link may be incomplete.</p>
            <a class="text-link text-link-strong" href="index.html#writing">Return to the writing <span>↗</span></a>
          </div>
        </section>
      `;
      document.title = "Note not found — Aziz Albahar";
      return;
    }

    document.title = `${article.title} — Aziz Albahar`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", article.excerpt);

    const currentIndex = articles.findIndex((item) => item.slug === article.slug);
    const related = [
      articles[(currentIndex + 1) % articles.length],
      articles[(currentIndex + 2) % articles.length],
    ];

    root.innerHTML = `
      <article>
        <header class="article-hero">
          <div class="article-hero-inner">
            <a class="article-breadcrumb" href="index.html#writing"><span aria-hidden="true">←</span> Back to the notebook</a>
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
            <nav id="article-toc-nav"></nav>
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
            <a href="index.html#writing">View every note ↗</a>
          </div>
          <div class="more-grid">
            ${related
              .map(
                (item) => `
                  <a class="more-card" href="${articleUrl(item)}">
                    <span>${escapeHtml(item.category)} · ${escapeHtml(item.readTime)}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.excerpt)}</p>
                  </a>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;

    addArticleMetadata(article);
    setupTableOfContents();
    setupCopyLink();
  }

  function addArticleMetadata(article) {
    if (document.querySelector('script[data-article-schema="true"]')) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.articleSchema = "true";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt,
      datePublished: article.date,
      author: { "@type": "Person", name: "Aziz Albahar", url: "https://www.azizalbahar.com" },
    });
    document.head.appendChild(script);
  }

  function setupTableOfContents() {
    const nav = document.querySelector("#article-toc-nav");
    const headings = [...document.querySelectorAll(".article-prose h2")];
    if (!nav || !headings.length) return;

    nav.innerHTML = headings
      .map((heading) => `<a href="#${escapeHtml(heading.id)}">${escapeHtml(heading.textContent)}</a>`)
      .join("");

    const links = [...nav.querySelectorAll("a")];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        links.forEach((link) => link.classList.toggle("is-current", link.hash === `#${visible.target.id}`));
      },
      { rootMargin: "-18% 0px -68%", threshold: 0 },
    );
    headings.forEach((heading) => observer.observe(heading));
  }

  function setupCopyLink() {
    const button = document.querySelector(".copy-button");
    const label = button?.querySelector("span");
    if (!button || !label) return;

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        label.textContent = "Copied";
      } catch {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        label.textContent = "Copied";
      }
      window.setTimeout(() => {
        label.textContent = "Copy link";
      }, 1800);
    });
  }

  setupTheme();
  setupMobileMenu();
  setupScrollUI();
  setupSearch();

  if (isHome) {
    renderHomeArticles();
    setupFilters();
  }

  if (isArticle) renderArticle();

  setupReveal();
})();
