# ADR 0003: Use centralized hash routing for desktop navigation

## Status

Accepted

## Context

Neo needs permanent navigation across its primary product areas in both Vite development and packaged Tauri builds. Packaged desktop assets have no web server that can rewrite arbitrary history paths to `index.html`. Route labels, icons, and paths must also remain consistent between the sidebar, tests, and future page composition.

## Decision

Use React Router with `HashRouter`. Keep primary route metadata in one typed `productRoutes` collection and compose route elements in `app/router.tsx`. The shell renders one shared outlet, while development-only surfaces remain outside the primary route collection and therefore outside navigation.

## Alternatives considered

- `BrowserRouter`: cleaner URLs, but packaged deep links depend on server-style fallback behavior that Tauri assets do not provide.
- A custom state-based page switcher: avoids a routing dependency but loses standard navigation semantics, history, links, and route testing.
- File-based routing: adds build tooling and conventions that the current small application does not need.

## Consequences

- Packaged navigation works without network or rewrite configuration.
- URLs contain a hash, which is acceptable for a local desktop application.
- New primary pages require updating the centralized route definition and router composition.
- Route tests can use memory or hash history without a Tauri runtime.
