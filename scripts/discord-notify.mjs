import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import yaml from "js-yaml";

/**
 * Reads `path`'s YAML frontmatter (between the leading `---` fences) and
 * returns { title, draft, enableComments }, or null if the file has no
 * frontmatter.
 */
export function readPostFrontmatterFromRaw(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const data = yaml.load(match[1]) ?? {};
  return {
    title: data.title,
    draft: data.draft === true,
    enableComments: data.enableComments === true,
  };
}

export function readPostFrontmatter(path) {
  return readPostFrontmatterFromRaw(readFileSync(path, "utf8"));
}

export function readPostFrontmatterAtRevision(revision, path) {
  try {
    const raw = execFileSync("git", ["show", `${revision}:${path}`], { encoding: "utf8" });
    return readPostFrontmatterFromRaw(raw);
  } catch {
    return null;
  }
}

export function isCommentThreadEligible(frontmatter) {
  return frontmatter?.enableComments === true && frontmatter?.draft !== true;
}

/**
 * Pure decision logic: given changed post files, return the ones that just
 * became eligible for a Discord comments thread in this push.
 */
export function selectPostsToNotify(changedPosts) {
  return changedPosts
    .filter(
      (postChange) =>
        isCommentThreadEligible(postChange.afterFrontmatter) &&
        !isCommentThreadEligible(postChange.beforeFrontmatter),
    )
    .map((postChange) => ({ threadName: postChange.afterFrontmatter.title, url: postChange.url }));
}

export function postUrlFor(blogSlug) {
  return `https://bhavanichandra.com/blogs/${blogSlug}`;
}

export function parseBlogPostIndexPath(path) {
  const match = path.match(/^blogs\/([^/]+)\/index\.md$/);
  if (!match) return null;
  return { slug: match[1] };
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
  const [webhookUrl, beforeSha, ...changedPaths] = process.argv.slice(2);
  if (!webhookUrl || !beforeSha) {
    console.error("usage: discord-notify.mjs <webhook-url> <before-sha> <changed-blog-path>...");
    process.exit(1);
  }

  const changedPosts = changedPaths
    .map((path) => ({ path, blogPostIndexPath: parseBlogPostIndexPath(path) }))
    .filter(({ path, blogPostIndexPath }) => blogPostIndexPath && existsSync(path))
    .map(({ path, blogPostIndexPath }) => {
      const beforeFrontmatter = readPostFrontmatterAtRevision(beforeSha, path);
      const afterFrontmatter = readPostFrontmatter(path);
      return { path, beforeFrontmatter, afterFrontmatter, url: postUrlFor(blogPostIndexPath.slug) };
    });

  const toNotify = selectPostsToNotify(changedPosts);
  if (toNotify.length === 0) {
    console.log("No posts became comment-enabled and live in this push.");
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
