# Neo

Neo is a local-first desktop application for managing the life, health, training, and memories of a dog. It is designed for Windows first while keeping the Tauri architecture portable to macOS.

Neo works offline. It has no backend, remote database, mandatory account, cloud dependency, telemetry, analytics, advertising, or hidden network requests. User data will live in a directory selected by the user and remain readable as versioned JSON plus separate media files.

The application includes its Spanish desktop shell and the first local-first onboarding slice. A user can create or open a validated local workspace, restore the active selection after restart, and review workspace information in Ajustes. Dog profile data remains intentionally unimplemented until its focused milestone issues.

> [!IMPORTANT]
> Neo is pre-alpha software. The generated scaffold is present, but the local profile workflow is not implemented yet. Track the first vertical slice in [milestone v0.1.0-alpha.1](https://github.com/anavalladaresg/Neo/milestone/1).

## Product language

Development artifacts are written in English. The application interface is written in Spanish using locale `es-ES` and default timezone `Europe/Madrid`. Identifiers in source code must never be Spanish.

## Technology

- Tauri 2 and stable Rust
- React, TypeScript, and Vite
- Tailwind CSS, React Router, Zustand, Zod, React Hook Form, Recharts, date-fns, and Lucide React as features require them
- ESLint, Prettier, Vitest, React Testing Library, Playwright, Cargo fmt, Clippy, and Cargo test for quality

Dependencies are added only in the issue that needs them. The initial scaffold intentionally remains small.

## Windows prerequisites

1. Install Node.js 22 or a compatible active LTS release.
2. Install Rust through `rustup` with the stable MSVC toolchain.
3. Install Visual Studio 2022 Build Tools with **Desktop development with C++**, the Windows SDK, and MSVC components.
4. Install WebView2 Runtime if Windows does not already provide it.
5. Install Git and GitHub CLI for repository workflows.

See the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for current platform details.

The Windows environment was verified on 2026-07-21 with Node.js 22.14.0, npm 11.10.0, Rust and Cargo 1.97.1, Rustup 1.29.0, the stable MSVC toolchain, Visual Studio Build Tools, the Windows SDK, and WebView2. Both Tauri development launch and Windows installer builds completed successfully.

## Development

```text
npm ci
npx playwright install chromium
npm run dev
npm run tauri dev
```

The first launch shows workspace onboarding. For disposable manual testing and application-local settings reset instructions, see [Local workspace](docs/local-workspace.md#manual-inspection-and-development-reset).

Quality and build commands:

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
npm run tauri build
```

See [Testing](docs/testing.md) for coverage thresholds, test layers, CI status names, and local browser setup.

## Documentation

- [Product requirements](docs/product-requirements.md)
- [Architecture](docs/architecture.md)
- [Data model](docs/data-model.md)
- [Local workspace](docs/local-workspace.md)
- [Testing](docs/testing.md)
- [Design system and desktop shell](docs/design-system.md)
- [GitHub workflow](docs/github-workflow.md)
- [Release process](docs/release-process.md)
- [Repository settings](docs/github-settings.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

Neo is licensed under the [MIT License](LICENSE).
