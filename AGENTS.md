# Neo repository instructions

These rules apply to every repository task.

## Language

- Write code, identifiers, tests, comments, docs, configuration, Git/GitHub content, changelogs, and release notes in English.
- Write all user-facing interface text in correct Spanish using locale `es-ES` and default timezone `Europe/Madrid`.
- Never use Spanish identifiers in source code.

## Required workflow

- Create or use a GitHub Issue before implementation. Bugs require reproduction and a failing regression test before the fix.
- Branch from updated `main` using `feat|fix|chore|docs|refactor|test/issue-<number>-<description>` or `release/v<version>`.
- Use small Conventional Commits. Keep each commit buildable and focused.
- Complete work through a focused pull request that contains `Closes #<number>`, follows the template, and remains draft until all required checks pass.
- Do not merge with failing checks, missing documentation, incomplete acceptance criteria, unresolved conversations, or missing required approval. Prefer rebase merging.

## Commands

```text
npm ci
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run test:coverage
npm run test:e2e
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml --all-features
npm run build
npm run tauri build
```

If a command is not available yet, link the GitHub Issue that will add it; never fake a successful result.

## Definition of done

- Linked issue acceptance criteria are satisfied.
- Behaviour, validation, serialization, migrations, persistence, Rust commands, accessibility, and critical flows have appropriate tests.
- Required local commands and GitHub Actions pass with no unexplained warnings.
- Coverage is at least 90% lines/statements/functions and 85% branches; workspace validation and migration modules are 100% covered.
- Documentation and changelog are updated when applicable.
- Commits are atomic, the PR is reviewed, and manual verification is recorded.
- No unexpected generated or untracked files remain.

## Data safety

- Neo is offline and local-first: no backend, remote database, account, telemetry, analytics, ads, or hidden network access.
- Use a user-selected workspace with small versioned JSON documents; do not introduce a database without an approved architecture issue and ADR.
- Validate JSON with Zod before state entry. Use stable UUIDs, ISO 8601 dates, workspace-relative media paths, and preserve safe unknown fields.
- Keep persistence outside React. Canonicalize paths, reject traversal and workspace escape, use atomic writes, and never replace a valid file with partial data.
- Back up before migrations. Detect malformed data and provide a clear Spanish recovery path.
- Never commit user workspaces, credentials, real private photographs, or veterinary documents.

## Reviews and maintenance

- Review for correctness, data loss, path security, offline guarantees, Spanish UX, accessibility, tests, and documentation.
- Update this file in the same PR when a recurring mistake or review rule should become permanent.
- Comments explain why. Every TODO must reference an existing issue, for example `TODO(#123)`.

## Prohibited actions

- Never force-push or commit directly to `main` after the initial scaffold, rewrite published history, bypass protection, delete the repository/default branch, or merge a failing PR.
- Never silently fix a bug, disable tests, lower coverage to pass CI, commit secrets/private data, introduce network access without approval, or make destructive filesystem changes outside the selected workspace.
