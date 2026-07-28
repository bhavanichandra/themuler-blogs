import { test } from "node:test";
import assert from "node:assert/strict";
import { selectPostsToNotify } from "./discord-notify.mjs";

test("fires only for newly-added posts with enableComments: true", () => {
  const result = selectPostsToNotify([
    { frontmatter: { title: "A", enableComments: true }, url: "https://x/a" },
    { frontmatter: { title: "B", enableComments: false }, url: "https://x/b" },
    { frontmatter: { title: "C" }, url: "https://x/c" },
  ]);
  assert.deepEqual(result, [{ threadName: "A", url: "https://x/a" }]);
});

test("returns nothing when no added posts opt in", () => {
  const result = selectPostsToNotify([{ frontmatter: { title: "B", enableComments: false }, url: "https://x/b" }]);
  assert.deepEqual(result, []);
});

test("never fires twice for the same post (caller passes each added path once)", () => {
  const addedOnce = [{ frontmatter: { title: "A", enableComments: true }, url: "https://x/a" }];
  assert.equal(selectPostsToNotify(addedOnce).length, 1);
  // A second, separate invocation (e.g. a rerun) with an empty added-set
  // (the file is no longer "added" — it already exists) notifies nothing.
  assert.equal(selectPostsToNotify([]).length, 0);
});
