import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBlogPostIndexPath, readPostFrontmatterFromRaw, selectPostsToNotify } from "./discord-notify.mjs";

test("parses blog post index paths", () => {
  assert.deepEqual(parseBlogPostIndexPath("blogs/my-post/index.md"), { slug: "my-post" });
  assert.equal(parseBlogPostIndexPath("blogs/my-post/cover.png"), null);
  assert.equal(parseBlogPostIndexPath("projects/my-post/index.md"), null);
  assert.equal(parseBlogPostIndexPath("blogs/nested/post/index.md"), null);
});

test("reads only YAML boolean true as true", () => {
  assert.deepEqual(
    readPostFrontmatterFromRaw(`---
title: "A"
draft: true
enableComments: true
---`),
    { title: "A", draft: true, enableComments: true },
  );

  assert.deepEqual(
    readPostFrontmatterFromRaw(`---
title: "B"
draft: "true"
enableComments: "true"
---`),
    { title: "B", draft: false, enableComments: false },
  );
});

test("fires for newly-added live posts with enableComments: true", () => {
  const result = selectPostsToNotify([
    {
      beforeFrontmatter: null,
      afterFrontmatter: { title: "A", draft: false, enableComments: true },
      url: "https://x/a",
    },
    {
      beforeFrontmatter: null,
      afterFrontmatter: { title: "B", draft: false, enableComments: false },
      url: "https://x/b",
    },
    {
      beforeFrontmatter: null,
      afterFrontmatter: { title: "C", draft: false },
      url: "https://x/c",
    },
  ]);
  assert.deepEqual(result, [{ threadName: "A", url: "https://x/a" }]);
});

test("fires when an existing post turns comments on", () => {
  const result = selectPostsToNotify([
    {
      beforeFrontmatter: { title: "A", draft: false, enableComments: false },
      afterFrontmatter: { title: "A", draft: false, enableComments: true },
      url: "https://x/a",
    },
  ]);
  assert.deepEqual(result, [{ threadName: "A", url: "https://x/a" }]);
});

test("fires when a draft post goes live with comments already enabled", () => {
  const result = selectPostsToNotify([
    {
      beforeFrontmatter: { title: "A", draft: true, enableComments: true },
      afterFrontmatter: { title: "A", draft: false, enableComments: true },
      url: "https://x/a",
    },
  ]);
  assert.deepEqual(result, [{ threadName: "A", url: "https://x/a" }]);
});

test("returns nothing when no changed posts become eligible", () => {
  const result = selectPostsToNotify([
    {
      beforeFrontmatter: { title: "B", draft: false, enableComments: false },
      afterFrontmatter: { title: "B", draft: false, enableComments: false },
      url: "https://x/b",
    },
    {
      beforeFrontmatter: null,
      afterFrontmatter: { title: "C", draft: true, enableComments: true },
      url: "https://x/c",
    },
  ]);
  assert.deepEqual(result, []);
});

test("does not fire again for already eligible posts", () => {
  const result = selectPostsToNotify([
    {
      beforeFrontmatter: { title: "A", draft: false, enableComments: true },
      afterFrontmatter: { title: "A", draft: false, enableComments: true },
      url: "https://x/a",
    },
  ]);
  assert.deepEqual(result, []);
});
