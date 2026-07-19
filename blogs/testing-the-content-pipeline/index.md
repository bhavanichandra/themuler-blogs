---
title: "Testing the Content Pipeline"
date: 2026-07-19
description: "First real post published through the new themuler-blogs -> bytes-of-me build-time fetch pipeline."
tags: ["meta"]
draft: false
# cover: "./cover.png"  # uncomment and add the image file if you want a card thumbnail
---

## Testing the Content Pipeline

<!-- Replace this with real content. -->

This post exists to verify that a merge here on `themuler-blogs` actually
flows through to a live deploy on bytes-of-me:

1. Merge this PR to `main`.
2. The `notify-deploy` GitHub Action POSTs the Vercel Deploy Hook.
3. Vercel rebuilds `bytes-of-me`, fetching this content at build time.
4. This post shows up at `bytes-of-me.vercel.app/blogs/testing-the-content-pipeline`.

<!-- Add a screenshot here, e.g.: -->
<!-- ![Description](./screenshot.png) -->
