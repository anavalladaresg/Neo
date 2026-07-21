# Testing

## Principles

Tests describe user-observable behaviour and domain guarantees in English. They do not assert private component structure merely to increase coverage. Every bug fix begins with an issue, a reproduction, and a failing regression test.

## Test layers

- **Unit:** pure validation, serialization, migrations, path normalization, date/number formatting, and domain rules.
- **Component:** React interactions, Spanish messages, keyboard flow, focus, and accessibility semantics using React Testing Library and user-event.
- **Integration:** state and persistence ports, typed Tauri adapters, error mapping, and recovery behaviour.
- **Rust:** command contracts, canonical path enforcement, atomic filesystem writes, failure recovery, and platform-specific behaviour.
- **End-to-end:** workspace creation/selection, profile create/edit, restart persistence, dashboard summary, corruption recovery, and primary-screen accessibility.

## Required commands

The complete policy is:

```text
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

Issue #3 introduces the missing frontend scripts and CI. Until then, `npm run build` is the verified scaffold check. Rust commands and Tauri builds require the stable Rust MSVC toolchain and Visual Studio Build Tools described in the README.

## Coverage

Initial thresholds are at least 90% for lines, statements, and functions, and at least 85% for branches. Workspace validation and migration modules require 100%. Thresholds must not be lowered to make CI pass, and generated/vendor code must not be counted as authored coverage.

## Fixtures and filesystem safety

Use fictional data and uniquely created temporary directories. Never use a home directory, repository root, or unresolved environment variable as a destructive cleanup target. Tests must verify the resolved cleanup path is the exact fixture root. No test may require external network access.

## Accessibility

Automated checks cover primary screens, but manual keyboard, focus, zoom/resize, contrast, and screen-reader smoke testing remain part of release verification. WCAG 2.2 AA is the target where applicable.

## Pull request evidence

Record commands, exit results, coverage, relevant platform/toolchain gaps, and manual checks in the PR. Upload screenshots for visible changes and failure artifacts for end-to-end tests when useful. Never report a command as passing if it was skipped, timed out, or unavailable.
