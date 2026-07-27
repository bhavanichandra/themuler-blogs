---
name: editorial-review
description: Review pending content changes (blogs/projects/journey markdown) for grammar, sentence structure, and technical-accuracy issues. Triggered manually by the repo owner, not automatically on every PR.
disable-model-invocation: true
---

# Editorial Review

Manually-triggered copy-editing pass over content changes in this repo. Not wired to a GitHub Action — the owner runs this themselves (locally, or via a remote/background agent) when a post is ready for a look, to avoid per-PR Anthropic API cost on every automated publish cycle.

## Scope

Only review markdown content under `blogs/`, `projects/`, and `journey/` — never review `.github/workflows/`, `config.yml`, or any other repo-infrastructure file. This is a copy-editing pass, not a code review.

## Process

1. **Find the diff to review.**
   - If given a PR number or URL as an argument, use `gh pr diff <number>`.
   - Otherwise, diff the `drafts` branch against `origin/main`: `git diff origin/main...drafts -- blogs projects journey`.
   - If neither yields a diff (nothing pending), say so and stop.
2. **For each changed content file**, read the full file (not just the diff hunk, so surrounding context is available) and check for:
   - Grammar and sentence-structure issues
   - Awkward or unclear phrasing
   - Technical inaccuracies, or claims that are inconsistent with the rest of the post
3. **Report findings directly in the conversation**, grouped by file, with the specific line/sentence quoted and a suggested fix. Don't invent issues to pad the report — if a file has nothing worth flagging, say so briefly rather than listing minor nitpicks.
4. **Do not edit files or commit anything yourself.** This is a suggestions-only pass — the owner applies whatever they agree with by hand afterward.
5. If a PR is already open for the reviewed diff (e.g. the `auto-open-draft-pr.yml` Action already opened one from `drafts` → `main`) and the owner asks for it, post the findings as `gh pr comment` instead of / in addition to the chat report — but default to a plain chat report unless asked.

## Out of scope

- Reviewing anything outside `blogs/`, `projects/`, `journey/`
- Auto-committing suggested fixes
- Running on a schedule or in response to GitHub events — this skill exists specifically so review is opt-in and cost is controlled by the owner choosing when to run it
