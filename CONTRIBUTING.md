# Contributing to Neo

Thank you for helping build Neo. Read [AGENTS.md](AGENTS.md) before making changes; it is the concise source of permanent repository rules.

## Before implementation

1. Search existing issues and pull requests.
2. Create or claim an issue with clear scope, acceptance criteria, testing expectations, and documentation expectations.
3. For a bug, document the environment, reproduction steps, expected and actual behaviour, severity, logs/screenshots, suspected area, and acceptance criteria. Reproduce it and add a failing regression test before fixing it.
4. Update local `main` and create a branch named for the issue.

Examples:

```text
feat/issue-42-edit-dog-profile
fix/issue-57-atomic-profile-write
docs/issue-63-recovery-guide
```

## Language and interface

All development content is English. All visible application text is Spanish. Format dates and numbers with `es-ES`; use `Europe/Madrid` as the application default timezone. Keep source identifiers in English.

## Development setup

Install the Windows prerequisites described in [README.md](README.md), then run:

```text
npm ci
npm run dev
```

Run the complete relevant validation matrix from [AGENTS.md](AGENTS.md) before requesting review. Do not claim a check passed unless its exit status was verified.

## Changes and commits

- Keep a pull request to one issue and one coherent outcome.
- Add only dependencies needed for that issue and explain why in the PR.
- Avoid unrelated formatting and refactoring.
- Use Conventional Commits such as `feat(profile): add dog profile validation`.
- Include tests with behaviour changes and documentation with architecture or behaviour changes.
- Reference an issue from every TODO.

## Pull requests

Open a draft pull request early and use the repository template. Include `Closes #<number>`, commands and results, coverage, screenshots for visible changes, schema and migration impact, documentation, risks, and manual verification.

Resolve all review conversations. Mark a PR ready only after every required check passes, then request review. Rebase merging is preferred to preserve focused commits and linear history.

## Security and privacy

Use generated fixtures only. Never commit a real workspace, personal credentials, private photographs, or veterinary records. Report vulnerabilities according to [SECURITY.md](SECURITY.md).
