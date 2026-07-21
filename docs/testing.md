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

Install dependencies with `npm ci`. Install the pinned Playwright browser runtime once per environment with `npx playwright install chromium`; Linux CI uses `npx playwright install --with-deps chromium`. Rust commands and Tauri builds require the stable Rust MSVC toolchain and Visual Studio Build Tools described in the README.

Vitest discovers component tests only under `src/`. Playwright owns tests under `e2e/`, starts the Vite server on `127.0.0.1:1420`, and retains traces, screenshots, and video only when they help diagnose failures. Workspace Playwright tests install an explicit browser adapter before navigation; production continues to use the Tauri command adapter. Browser tests must never automate or bypass real operating-system folder dialogs.

## Coverage

Initial thresholds are at least 90% for lines, statements, and functions, and at least 85% for branches. Workspace validation and migration modules require 100%. Thresholds must not be lowered to make CI pass, and generated/vendor code must not be counted as authored coverage.

The workspace suite covers manifest and name validation, typed Tauri result parsing, error mapping, state transitions, Spanish onboarding interactions, focus, settings, and accessibility. The manifest and workspace-name validation modules require and maintain 100% coverage. New features must expand the suite rather than relying on the existing denominator.

## Fixtures and filesystem safety

Use fictional data and uniquely created temporary directories. Never use a home directory, repository root, or unresolved environment variable as a destructive cleanup target. Tests must verify the resolved cleanup path is the exact fixture root. No test may require external network access.

## Accessibility

Automated checks cover primary screens, but manual keyboard, focus, zoom/resize, contrast, and screen-reader smoke testing remain part of release verification. WCAG 2.2 AA is the target where applicable.

The component suite uses axe-core for automatically detectable violations on onboarding, recoverable errors, the active shell, and workspace settings. JSDOM color-contrast checks are disabled because the environment cannot calculate rendered colors; rendered contrast remains a manual verification responsibility. Playwright covers workspace creation/opening through the controlled adapter, primary navigation, arrow/Home/End keys, active-route semantics, confirmation-dialog Escape behavior, focus restoration, and horizontal overflow at `1180 × 780` and `760 × 600`.

## Pull request evidence

Record commands, exit results, coverage, relevant platform/toolchain gaps, and manual checks in the PR. Upload screenshots for visible changes and failure artifacts for end-to-end tests when useful. Never report a command as passing if it was skipped, timed out, or unavailable.

## Continuous integration

`.github/workflows/ci.yml` runs for pull requests and pushes to `main`. Its required status names are:

- `Formatting`
- `ESLint`
- `TypeScript`
- `Frontend unit tests`
- `Frontend coverage`
- `Frontend build`
- `End-to-end tests`
- `Rust quality`
- `Windows Tauri build`

Every npm job installs from `package-lock.json`; Rust jobs use `src-tauri/Cargo.lock` and the stable toolchain declared in `rust-toolchain.toml`. Node and Cargo caches are keyed through their official lockfiles. Workflow permissions are read-only. Coverage is uploaded for seven days, failed Playwright diagnostics for seven days, and Windows installers for fourteen days.

On the verified Spanish Windows toolchain, Rust 1.97.1 may emit a `linker_messages` warning after a successful test or Tauri link because localized MSVC output is not classified as a recognized informational message. Clippy with `-D warnings` remains clean. Do not suppress this lint globally; record the exact warning until the Rust/MSVC behaviour changes.
