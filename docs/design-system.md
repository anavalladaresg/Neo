# Design system and desktop shell

## Purpose

Neo's design system provides a warm, calm, desktop-first interface without coupling product features to page-specific styling. It uses semantic CSS tokens, small React primitives, Lucide icons, and native HTML semantics. The implementation is original and uses no photographs or final branding assets.

Final application icon and brand assets are tracked separately in [issue #17](https://github.com/anavalladaresg/Neo/issues/17). Do not treat the temporary `N` mark as approved artwork.

## Source structure

```text
src/
  app/
    router.tsx          route composition and fallback
    routes.ts           primary navigation definitions
  components/
    feedback/           empty, loading, and error states
    layout/             desktop shell and content outlet
    navigation/         sidebar and navigation items
    ui/                 buttons, cards, badges, fields, headers, and dialogs
  pages/                route content and the hidden component showcase
  styles/
    tokens.css          semantic values and Tailwind theme mapping
    globals.css         browser reset, focus, and reduced motion
    components.css      shared primitive styling
    shell.css           shell, navigation, page, and responsive layout
```

Keep shared primitives independent from page-specific content. Add an abstraction only when a current screen uses it. Components use named exports, colocated props, semantic HTML, and Lucide icons with decorative icons hidden from assistive technology.

## Tokens

`src/styles/tokens.css` is the only source for palette, typography, spacing, radii, shadows, focus, and shell-size values. Component styles consume `--neo-*` semantic variables and never scatter raw palette colors through TSX files.

Token groups include:

- background, surface, muted surface, and border
- primary sage and accent terracotta roles
- success, warning, danger, and their soft surfaces
- text, muted text, focus, and overlay
- sans-serif interface and serif display typefaces using offline system fonts
- spacing, radii, shadows, sidebar widths, and content width

Tailwind CSS 4 maps the color, font, and radius roles through `@theme`. Prefer semantic names such as `background`, `surface`, `primary`, and `danger`. A new token needs a reusable visual meaning; page-specific values do not belong in the global token file.

## Shared components

- `Button`: semantic button with primary, secondary, quiet, and danger tones.
- `Card`: surface container with optional title, description, and action.
- `Badge`: compact text status with optional decorative Lucide icon.
- `TextField`: label, hint, and accessible error association.
- `PageHeader`: one page-level heading, description, eyebrow, and optional action.
- `EmptyState`: honest absence message with optional action.
- `LoadingState`: polite live status with reduced-motion-compatible progress icon.
- `ErrorState`: alert with a useful Spanish recovery message and optional action.
- `ConfirmationDialog`: native modal dialog with initial focus, cancellation, Escape support, and focus restoration.

Visible copy supplied to components is Spanish. Component and prop identifiers remain English. Native elements are preferred over redundant ARIA.

## Application shell and routing

`AppShell` owns the skip link, sidebar, top status bar, main landmark, and route outlet. `productRoutes` is the single source for primary paths, Spanish labels, descriptions, and Lucide icons. `HashRouter` keeps packaged Tauri navigation independent from server rewrite behavior.

The hidden `#/componentes` page provides a stable development and test surface for shared states and dialog behavior. It is deliberately absent from `productRoutes` and therefore from production navigation.

To add a primary navigation page:

1. Add one typed definition to `productRoutes` with an English path, Spanish title and description, and a Lucide icon.
2. Add the page element in `router.tsx`; use `PlaceholderPage` only while its domain issue is intentionally out of scope.
3. Preserve one visible `h1` and a logical heading hierarchy.
4. Extend component and Playwright navigation assertions.
5. Document and test any new responsive or accessibility behavior.

## Window and overflow behavior

- Recommended window: `1180 × 780` CSS pixels.
- Minimum supported window: `760 × 600` CSS pixels.
- Above `860` CSS pixels, the sidebar displays icons and text labels.
- At `860` CSS pixels and below, the permanent sidebar becomes compact. Text is visually hidden but remains the accessible link name; no hamburger menu is introduced.
- Main content scrolls vertically inside its region. The application body and grid columns use `min-width: 0` to prevent horizontal overflow.
- Two-column cards wrap to one column when space is constrained.
- Navigation labels truncate only in the expanded sidebar. Descriptions and page content wrap normally.
- Text scaling is supported through relative units and flexible grids; fixed heights are reserved for controls and icons.

Do not reduce the minimum window without adding layout and keyboard evidence at the new size.

## Visual reference

These screenshots record the Issue #4 implementation and are embedded in its pull request:

- [Expanded desktop shell](screenshots/issue-4/desktop-shell.png)
- [Compact minimum-size shell](screenshots/issue-4/desktop-shell-compact.png)
- [Confirmation dialog](screenshots/issue-4/confirmation-dialog.png)

They are implementation evidence, not final brand artwork. Update them only when a focused user-interface change materially changes the documented behavior.

## Accessibility

Neo targets WCAG 2.2 AA where applicable.

- The sidebar is a named navigation landmark and the active link exposes `aria-current="page"`.
- Tab reaches every interactive element. Arrow keys move through primary links; Home and End move to the first and last link.
- A skip link moves keyboard focus to the main content.
- Global `:focus-visible` styles use a high-contrast semantic focus token.
- State is communicated by text and semantics, not color alone.
- Loading uses `role="status"` with a polite live region; errors use `role="alert"`.
- The confirmation dialog uses the native modal focus boundary, supports Escape, and restores focus to the invoking control.
- Decorative icons use `aria-hidden="true"`.
- `prefers-reduced-motion` removes meaningful transition and animation duration.

axe-core component checks cover detectable semantics. Its JSDOM run excludes color contrast because JSDOM cannot calculate rendered colors; contrast, focus visibility, resizing, and text scaling require rendered manual verification.

## Testing shared components

Place behavior tests beside the component. Test visible Spanish copy and semantic roles while keeping test descriptions in English. Cover optional actions, live-region behavior, label associations, focus movement, cancellation, confirmation, Escape, and focus restoration. Do not assert private class structure or use snapshots as the only evidence.

Playwright verifies the complete rendered shell, all navigation labels, route changes, keyboard movement, dialog Escape behavior, and absence of horizontal overflow at both documented window sizes.

Run:

```text
npm run test
npm run test:coverage
npm run test:e2e
```

## Asset rules

Use Lucide React for interface icons. Do not use emoji, private photographs, traced artwork, or unapproved generated final branding. Any future asset must have documented ownership, source, license, and generation process before it is committed.
