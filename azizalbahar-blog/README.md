# Aziz Albahar — blog concept

A blog-first redesign for `azizalbahar.com`, built as a fast, dependency-free static site. It includes a responsive editorial homepage, topic filters, search, dark mode, pre-rendered article pages, reading progress, tables of contents, RSS, sitemap metadata, and an original featured story.

## Run locally

```bash
npm run dev
```

Then open [http://localhost:4173](http://localhost:4173).

## Build

```bash
npm run check
npm run build
```

The deployable output is written to `dist/`. Article content lives in `content.js`; the build script turns each entry into a pre-rendered page at `/writing/<slug>/`.

The current story copy is a launch-ready editorial draft. Review personal details and voice before publishing it under your name.
