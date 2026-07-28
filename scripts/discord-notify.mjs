import { readFileSync } from "node:fs";
import yaml from "js-yaml";

/**
 * Reads `path`'s YAML frontmatter (between the leading `---` fences) and
 * returns { title, enableComments }, or null if the file has no frontmatter.
 */
export function readPostFrontmatter(path) {
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const data = yaml.load(match[1]);
  return { title: data.title, enableComments: Boolean(data.enableComments) };
}

/**
 * Pure decision logic: given newly-added post files (only — never edits to
 * existing posts, guaranteed by the caller only ever diffing added files),
 * return the ones that should notify Discord. Idempotent by construction —
 * a given path can only ever appear as "added" once in git history.
 */
export function selectPostsToNotify(addedPosts) {
  return addedPosts
    .filter((p) => p.frontmatter?.enableComments === true)
    .map((p) => ({ threadName: p.frontmatter.title, url: p.url }));
}

export function postUrlFor(blogSlug) {
  return `https://bhavanichandra.com/blogs/${blogSlug}`;
}

async function notifyDiscord(webhookUrl, post) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_name: post.threadName,
      content: post.url,
    }),
  });
  if (!res.ok) {
    throw new Error(`Discord webhook failed for "${post.threadName}": ${res.status} ${await res.text()}`);
  }
}

async function main() {
  const [webhookUrl, ...addedPaths] = process.argv.slice(2);
  if (!webhookUrl) {
    console.error("usage: discord-notify.mjs <webhook-url> <added-index.md-path>...");
    process.exit(1);
  }

  const addedPosts = addedPaths
    .filter((path) => path.startsWith("blogs/") && path.endsWith("/index.md"))
    .map((path) => {
      const frontmatter = readPostFrontmatter(path);
      const slug = path.split("/")[1];
      return { path, frontmatter, url: postUrlFor(slug) };
    });

  const toNotify = selectPostsToNotify(addedPosts);
  if (toNotify.length === 0) {
    console.log("No newly-added posts with enableComments: true.");
    return;
  }

  for (const post of toNotify) {
    await notifyDiscord(webhookUrl, post);
    console.log(`Notified Discord for "${post.threadName}"`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
