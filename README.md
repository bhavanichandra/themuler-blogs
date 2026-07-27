# themuler-blogs

Content source for [bytes-of-me](https://github.com/bhavanichandra/bytes-of-me) — blog posts and project write-ups, as plain markdown. This repo has no site build of its own; a merge to `main` is fetched and rendered by bytes-of-me at build time (see below). It does hold a small Node script (`scripts/discord-notify.mjs`) backing the Discord comments-thread automation described below.

## Publishing model

**A push to `main` that touches `blogs/**` or `projects/**` is a publish.** There's no separate CMS or staging step — merging a PR is the common case, but any push to `main` under those paths (including a direct push, if branch protection allows it) triggers the same flow:

1. Write/edit a post here, open a PR, merge it to `main`.
2. `.github/workflows/notify-deploy.yml` fires on that push and POSTs the Vercel Deploy Hook URL, read from the `VERCEL_DEPLOY_HOOK_URL` repository secret (Settings → Secrets and variables → Actions). Changes that don't touch `blogs/**`/`projects/**` — like this README — are excluded by the workflow's `paths` filter and don't trigger anything.
3. Vercel rebuilds `bytes-of-me`, which fetches this repo's `main` at build time and folds it into the site.
4. It's live within a couple minutes of the merge.

**This only works if `VERCEL_DEPLOY_HOOK_URL` is configured as a repo secret.** If it's missing or empty, step 2's `curl` fails, the workflow run shows as failed in the Actions tab, and nothing gets published automatically — the content is merged here but bytes-of-me won't pick it up until the next unrelated deploy (or a manual Deploy Hook trigger).

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

`blogs/` entries additionally support:

| Field             | Type              | Notes                                                                                   |
|-------------------|-------------------|-------------------------------------------------------------------------------------------|
| `quest`           | string, optional  | Matches a Journey day's `quest` value, for build-time auto-linking (see bytes-of-me#51)   |
| `enableComments`  | boolean, default `false` | When `true`, publishing this post auto-creates a Discord forum thread — see below   |

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

## Discord comments-thread automation

`.github/workflows/notify-deploy.yml`'s `discord-thread-for-new-posts` job runs on every push to `main` touching `blogs/**`: it diffs the push for **newly-added** post files only (never edits to existing posts), reads each one's frontmatter via `scripts/discord-notify.mjs`, and POSTs to the `DISCORD_WEBHOOK_URL` repo secret (`thread_name` = post title, message = the live post URL) for any with `enableComments: true`. A post can only ever spawn one thread, since a given path can only appear as "added" once in git history.

Requires `DISCORD_WEBHOOK_URL` configured as a repo secret, pointed at the `#blog-posts` Forum Channel's webhook (see bytes-of-me#58's owner action items for server/channel setup).

Run `npm install && npm test` to run `scripts/discord-notify.mjs`'s unit tests.

## Local preview

This repo has no build of its own — to preview a post rendered on the actual site, run bytes-of-me locally (`bun run dev`), which fetches this repo's `main` branch at dev-server start. There's currently no way to preview against an unmerged branch/PR here; write and review the markdown directly, merge, and it'll be live shortly after.
