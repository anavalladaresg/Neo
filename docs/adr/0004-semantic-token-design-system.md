# ADR 0004: Build the interface from semantic tokens and native primitives

## Status

Accepted

## Context

Neo needs a recognizable warm interface, consistent accessible states, and a maintainable foundation for multiple product areas. A large component library would add styling assumptions and dependency weight before the product needs complex widgets. Raw color and spacing values distributed through components would make visual evolution unsafe and inconsistent.

## Decision

Use Tailwind CSS 4 as the build-time styling engine while defining Neo's visual language as semantic `--neo-*` CSS tokens. Build the currently required React primitives with native semantic elements and Lucide icons. Use the native HTML dialog for modal focus behavior. Keep page, shell, and shared component styles separated by responsibility.

## Alternatives considered

- Adopt a full third-party component library: faster initial breadth, but unnecessary weight and a generic visual language for the current scope.
- Use only inline Tailwind utilities: compact for isolated screens, but makes semantic token ownership and shared state styling harder to audit.
- Use CSS Modules per component: strong local isolation, but more files and indirection than the small shared system currently requires.
- Use raw CSS values per component: minimal setup but creates drift and makes later theme changes risky.

## Consequences

- Palette changes happen centrally without editing TSX.
- Shared components remain small, typed, accessible, and visually specific to Neo.
- Developers must add tokens by semantic role rather than convenience.
- Complex future widgets may justify an approved headless primitive dependency in their own issue and ADR.
