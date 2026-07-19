# themuler-blogs

Content source for [bytes-of-me](https://github.com/bhavanichandra/bytes-of-me) — blog posts and project write-ups, as plain markdown. This repo holds no build tooling of its own; a merge to `main` is fetched and rendered by bytes-of-me at build time (see below).

## Publishing model

**A merge to `main` is a publish.** There's no separate CMS or staging step:

1. Write/edit a post here, open a PR, merge it to `main`.
2. `.github/workflows/notify-deploy.yml` fires a Vercel Deploy Hook.
3. Vercel rebuilds `bytes-of-me`, which fetches this repo's `main` at build time and folds it into the site.
4. It's live within a couple minutes of the merge.

Nothing here is ever committed into `bytes-of-me` — this repo is the single source of truth for content, fetched fresh on every build.

## Folder structure

Both blogs and projects follow the same nested, co-located layout — a folder per entry, named for its slug, holding an `index.md` plus any images it references:

```
blogs/
  <slug>/
    index.md
    cover.png       (optional)
    diagram.png     (optional, referenced inline)
projects/
  <slug>/
    index.md
    cover.png       (optional)
```

The slug comes from the folder name — there's no separate `slug` field in frontmatter.

## Frontmatter schema

Shared by both `blogs/` and `projects/`:

| Field         | Type            | Notes                                                        |
|---------------|-----------------|---------------------------------------------------------------|
| `title`       | string          |                                                                 |
| `date`        | date            | `YYYY-MM-DD`                                                   |
| `description` | string          | Card/preview blurb                                              |
| `tags`        | string[]        |                                                                 |
| `draft`       | boolean         | Draft entries are fetched but filtered out of listings/pages    |
| `cover`       | string, optional| Relative path to a colocated image, e.g. `./cover.png`         |

`projects/` entries additionally support:

| Field  | Type            | Notes                                      |
|--------|-----------------|---------------------------------------------|
| `href` | string, optional| External link — repo, live demo, etc.       |

Example (`blogs/my-post/index.md`):

```md
---
title: "My Post"
date: 2026-07-19
description: "One-line summary for the card preview."
tags: ["mulesoft", "architecture"]
draft: false
cover: "./cover.png"
---

## My Post

Body content here. Inline images use normal relative markdown syntax,
pointing at files colocated in this same folder:

![Diagram](./diagram.png)
```

## Images

Keep images colocated in the same folder as the `index.md` that uses them — no shared/global image directory. Reference the `cover` field for card thumbnails, and plain relative markdown image syntax (`![alt](./file.png)`) for anything inline in the body.

## Local preview

This repo has no build of its own — to preview a post rendered on the actual site, run bytes-of-me locally (`bun run dev`), which fetches this repo's `main` branch at dev-server start. There's currently no way to preview against an unmerged branch/PR here; write and review the markdown directly, merge, and it'll be live shortly after.
