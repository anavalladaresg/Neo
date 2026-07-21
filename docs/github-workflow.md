# GitHub workflow

GitHub Issues and pull requests are the source of truth for Neo development.

## Issues

Create an issue before every feature, bug, refactor, infrastructure change, documentation task, or significant maintenance task. Use the repository forms and apply type, area, priority, milestone, and blocked labels as applicable.

Feature issues define problem statement, user value, scope, out-of-scope items, acceptance criteria, testing, and documentation. Bug issues additionally define environment, reproduction, expected and actual behaviour, severity, evidence, and suspected area.

Never silently fix a discovered bug. Create and label it, reproduce it, add a failing regression test, fix it, pass the test, update affected docs, and link the pull request.

## Branches

Update `main`, then create one of:

```text
feat/issue-<number>-short-description
fix/issue-<number>-short-description
chore/issue-<number>-short-description
docs/issue-<number>-short-description
refactor/issue-<number>-short-description
test/issue-<number>-short-description
release/v<version>
```

Do not commit directly to `main` after the initial scaffold. Do not force-push reviewed work or rewrite shared history.

## Commits

Use focused Conventional Commits. Each commit leaves the repository buildable, includes direct tests and documentation when needed, and avoids unrelated changes. A feature and its direct tests may share a commit when separation would leave a broken state.

## Pull requests

Open a draft PR through the template and include `Closes #<number>`. Explain why, implementation, tests, exact commands/results, screenshots, documentation, schema/migration impact, risks, limitations, and manual verification.

Keep draft status until the complete required check matrix passes. Request review, resolve every conversation, and confirm acceptance criteria before marking ready or merging. Rebase merge is preferred for linear atomic history.

Never merge with failed/missing required checks, type or lint errors, Rust failures, a failed Windows build, missing documentation, unresolved conversations, incomplete criteria, or missing approval.

## Labels

Required labels include:

- `type: bug`, `type: feature`, `type: chore`, `type: documentation`, `type: refactor`
- `area: ui`, `area: storage`, `area: desktop`, `area: testing`, `area: ci`
- `priority: high`, `priority: medium`, `priority: low`
- `status: blocked`

## Milestones and releases

Issues and focused PRs roll up to coherent milestones. Releases follow [release-process.md](release-process.md); not every commit receives a tag or release.
