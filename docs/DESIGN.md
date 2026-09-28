---
version: alpha
name: sulchedule-design-system
description: A web-first commerce interface for whisky price comparison, collections, and drink planning. White canvas, a single warm orange accent for actions and savings, and a neutral gray ramp carrying all hierarchy. Cards and modals are the primary containers; the desktop layout is the reference, and a fixed bottom nav covers the narrow fallback below `sm`.

colors:
  primary: "#ff8904"
  primary-strong: "#a35700"
  primary-focus: "#e07800"
  primary-on-dark: "#ffa833"
  on-primary: "#ffffff"

  fg: "#101828"
  fg-muted: "#6a7282"
  fg-subtle: "#8d95a3"
  fg-on-dark: "#ffffff"

  canvas: "#ffffff"
  surface-muted: "#f9fafb"
  surface-sunken: "#f3f4f6"
  surface-inverse: "#101828"
  surface-footer: "#ebebeb"
  scrim: "rgba(0, 0, 0, 0.5)"

  border: "#e5e7eb"
  border-strong: "#d1d5db"
  border-inverse: "#101828"

  danger: "#e7000b"
  danger-surface: "#fef2f2"
  success: "#00a63e"
  kakao: "#fee500"

font:
  family: "Pretendard Variable, Pretendard, system-ui, sans-serif"

font-size:
  t1: 0.6875rem
  t2: 0.75rem
  t3: 0.8125rem
  t4: 0.875rem
  t5: 1rem
  t6: 1.125rem
  t7: 1.25rem
  t8: 1.375rem
  t9: 1.5rem
  t10: 1.625rem
  t11: 1.75rem
  t12: 2rem
  t13: 2.5rem
  t14: 3rem
  t1-static: 11px
  t2-static: 12px
  t3-static: 13px
  t4-static: 14px
  t5-static: 16px
  t6-static: 18px
  t7-static: 20px
  t8-static: 22px
  t9-static: 24px
  t10-static: 26px
  t11-static: 28px
  t12-static: 32px
  t13-static: 40px
  t14-static: 48px

line-height:
  t1: 0.9375rem
  t2: 1rem
  t3: 1.125rem
  t4: 1.1875rem
  t5: 1.375rem
  t6: 1.5rem
  t7: 1.6875rem
  t8: 1.875rem
  t9: 2rem
  t10: 2.1875rem
  t11: 2.375rem
  t12: 2.625rem
  t13: 3.25rem
  t14: 3.75rem
  t1-static: 15px
  t2-static: 16px
  t3-static: 18px
  t4-static: 19px
  t5-static: 22px
  t6-static: 24px
  t7-static: 27px
  t8-static: 30px
  t9-static: 32px
  t10-static: 35px
  t11-static: 38px
  t12-static: 42px
  t13-static: 52px
  t14-static: 60px

font-weight:
  regular: 400
  medium: 500
  bold: 700

typography:
  page-title:
    fontSize: "{font-size.t9}"
    lineHeight: "{line-height.t9}"
    fontWeight: "{font-weight.bold}"
    letterSpacing: -0.02em
  section-title:
    fontSize: "{font-size.t6}"
    lineHeight: "{line-height.t6}"
    fontWeight: "{font-weight.bold}"
    letterSpacing: -0.01em
  card-title:
    fontSize: "{font-size.t5}"
    lineHeight: "{line-height.t5}"
    fontWeight: "{font-weight.medium}"
    letterSpacing: 0
  body:
    fontSize: "{font-size.t5}"
    lineHeight: "{line-height.t5}"
    fontWeight: "{font-weight.regular}"
    letterSpacing: 0
  body-sm:
    fontSize: "{font-size.t4}"
    lineHeight: "{line-height.t4}"
    fontWeight: "{font-weight.regular}"
    letterSpacing: 0
  body-sm-strong:
    fontSize: "{font-size.t4}"
    lineHeight: "{line-height.t4}"
    fontWeight: "{font-weight.medium}"
    letterSpacing: 0
  price:
    fontSize: "{font-size.t5}"
    lineHeight: "{line-height.t5}"
    fontWeight: "{font-weight.medium}"
    letterSpacing: 0
  price-sub:
    fontSize: "{font-size.t2}"
    lineHeight: "{line-height.t2}"
    fontWeight: "{font-weight.regular}"
    letterSpacing: 0
  price-discount:
    fontSize: "{font-size.t4}"
    lineHeight: "{line-height.t4}"
    fontWeight: "{font-weight.medium}"
    letterSpacing: 0
  button:
    fontSize: "{font-size.t4-static}"
    lineHeight: "{line-height.t4-static}"
    fontWeight: "{font-weight.medium}"
    letterSpacing: 0
  label:
    fontSize: "{font-size.t2-static}"
    lineHeight: "{line-height.t2-static}"
    fontWeight: "{font-weight.regular}"
    letterSpacing: 0
  caption:
    fontSize: "{font-size.t2}"
    lineHeight: "{line-height.t2}"
    fontWeight: "{font-weight.regular}"
    letterSpacing: 0

rounded:
  none: 0px
  sm: 0.5rem
  md: 0.625rem
  lg: 1rem
  xl: 1.25rem
  xxl: 1.75rem
  full: 9999px

glass:
  tint-light: "rgba(255, 255, 255, 0.88)"
  tint-scrim: "rgba(0, 0, 0, 0.32)"
  blur: 20px
  saturate: 180%
  hairline: "rgba(255, 255, 255, 0.55)"
  edge: "rgba(0, 0, 0, 0.06)"

motion:
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
  spring-soft: "cubic-bezier(0.32, 1.28, 0.58, 1)"
  ease-out: "cubic-bezier(0.22, 0.61, 0.36, 1)"
  duration-fast: 180ms
  duration-base: 280ms
  duration-slow: 420ms

z-layer:
  sticky: 30
  nav: 40
  overlay: 60

spacing:
  xxs: 0.25rem
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.25rem
  xl: 1.5rem
  xxl: 2rem
  bottom-nav-safe: 5rem

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0.625rem 1rem
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.fg}"
    borderColor: "{colors.border-strong}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0.625rem 1rem
  button-inverse:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.fg-on-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0.625rem 1rem
  button-kakao:
    backgroundColor: "{colors.kakao}"
    textColor: "{colors.fg}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0.625rem 1rem
  icon-button:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.fg}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    size: 2rem
  icon-button-active:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.fg-on-dark}"
    borderColor: "{colors.border-inverse}"
    rounded: "{rounded.md}"
    size: 2rem
  header:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.border-strong}"
    padding: 1rem 0.5rem
  search-bar:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 0.5rem
  bottom-nav:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.surface-sunken}"
    textColor: "{colors.fg}"
    typography: "{typography.label}"
    height: 3.5rem
  bottom-nav-item-active:
    textColor: "{colors.primary}"
    typography: "{typography.label}"
  product-card:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    metaBackgroundColor: "{colors.surface-muted}"
    padding: 0.75rem 1rem
  discount-badge:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.price-discount}"
    padding: 0.375rem 0.75rem
  modal:
    backgroundColor: "{colors.canvas}"
    scrimColor: "{colors.scrim}"
    rounded: "{rounded.md}"
    padding: 1.5rem
    maxWidth: 800px
  bottom-sheet:
    backgroundColor: "{colors.canvas}"
    scrimColor: "{colors.scrim}"
    rounded: "{rounded.xl}"
    padding: 1.5rem
    maxWidth: 800px
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.fg}"
    borderColor: "{colors.border-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 0.625rem 0.75rem
  input-error:
    borderColor: "{colors.danger}"
    textColor: "{colors.danger}"
  footer:
    backgroundColor: "{colors.surface-footer}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.body-sm}"
    padding: 1.25rem
---

## Overview

Sulchedule is a web-first commerce app for comparing whisky prices across Korea and Japan, saving bottles into collections, and planning drinks. The reference layout is the desktop browser: a white canvas, a multi-column product grid under inline header navigation, with the numbers dense enough to compare at a glance.

Hierarchy comes almost entirely from the neutral gray ramp and from weight, not from color. The orange accent is reserved for two jobs — the primary action, and the savings signal (discount rate). That restraint is what keeps a price-comparison screen from turning into noise, because in this product the *numbers* are the content.

Phone width is a narrowed version of the same layout, not a separate design: the grid collapses to two columns and the inline header links give way to a fixed bottom nav below `sm`.

### Signature Traits

- Single orange accent (`{colors.primary}` — #ff8904) for primary actions and discount rates. No second brand color.
- Product card is the atom: bordered white container, `{rounded.lg}` radius, image on top, meta panel on `{colors.surface-muted}` below.
- Neutral-driven hierarchy — `{colors.fg}` for primary text, `{colors.fg-muted}` for secondary, and that is usually the whole story.
- Inline header navigation at `sm` and up; below `sm` it falls back to a fixed bottom nav, and every scrollable page reserves `{spacing.bottom-nav-safe}` of bottom padding there so content clears it.
- Overlays come in two forms only: centered `{component.modal}` and `{component.bottom-sheet}`, both over a 50% black scrim with backdrop blur.

## Colors

### Brand & Accent
- **Action Orange** (`{colors.primary}` — #ff8904, `hsl(32 100% 51%)`): The brand accent. Used as a **fill** behind white text on primary buttons, and as the **text** color for discount rates on the white card badge. Against white it measures 2.38:1 — fine for the large, bold discount number (which is decorative reinforcement of the price beside it), but never for small body text.
- **Strong Orange** (`{colors.primary-strong}` — #a35700, `hsl(32 100% 32%)`): The text form of the accent — 5.36:1 on white. Any accent-colored *sentence* or link on a light surface uses this, not `{colors.primary}`.
- **Focus Orange** (`{colors.primary-focus}` — #e07800): The focus ring (`outline: 2px solid`). 3.06:1 on white clears the 3:1 non-text threshold a focus indicator needs.
- **Glow Orange** (`{colors.primary-on-dark}` — #ffa833): The accent on `{colors.surface-inverse}` — 7.74:1. Only for dark surfaces.

### Foreground
- **FG** (`{colors.fg}` — #101828): Primary text. Product names, prices, headings, input values.
- **FG Muted** (`{colors.fg-muted}` — #6a7282): Secondary text. Original (English) product names, volume, yen sub-price, footer copy. 4.84:1 on white — the lightest gray that still clears AA for body text, which is why it is the floor for anything a user must read.
- **FG Subtle** (`{colors.fg-subtle}` — #8d95a3): 3.02:1 — **placeholder and decorative text only.** Search placeholders, disabled labels, separator glyphs. Never for content.
- **FG On Dark** (`{colors.fg-on-dark}` — #ffffff): Text on `{colors.surface-inverse}` and on `{colors.primary}`.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): The default page and card background.
- **Surface Muted** (`{colors.surface-muted}` — #f9fafb): The card meta panel under the product image, and quiet section fills. Just off-white enough to separate the text block from the image block without a border.
- **Surface Sunken** (`{colors.surface-sunken}` — #f3f4f6): Recessed controls — the header search bar, image placeholders, skeletons. Reads as "something goes in here."
- **Surface Inverse** (`{colors.surface-inverse}` — #101828): Selected/active state on icon buttons (the saved bookmark), and high-emphasis inverse buttons.
- **Surface Footer** (`{colors.surface-footer}` — #ebebeb): The footer band. A deliberate step darker than `{colors.surface-sunken}` to close the page.
- **Scrim** (`{colors.scrim}` — `rgba(0,0,0,0.5)`): Behind every overlay, paired with `backdrop-filter: blur`.

### Border
- **Border** (`{colors.border}` — #e5e7eb): The default hairline. Card outlines, icon buttons, dividers.
- **Border Strong** (`{colors.border-strong}` — #d1d5db): Inputs and the header's scrolled-state bottom border — where the boundary is functional rather than decorative.
- **Border Inverse** (`{colors.border-inverse}` — #101828): Pairs with `{colors.surface-inverse}` on active icon buttons.

### Status
- **Danger** (`{colors.danger}` — #e7000b) on **Danger Surface** (`{colors.danger-surface}` — #fef2f2): Form validation errors, destructive confirmations (delete collection, withdraw).
- **Success** (`{colors.success}` — #00a63e): Confirmation toasts and success states.
- **Kakao** (`{colors.kakao}` — #fee500): The Kakao login button only. A vendor-mandated brand color, not part of the palette — never reuse it for anything else.

## Typography

Pretendard is the base face, and the token structure follows the SEED (Karrot) model: font size, line height, and font weight are three independent ramps that combine into text styles. The semantic styles below are the SEED "semantic text style" tier — each carries a design intent, so components reference these rather than raw ramp steps.

### Font Family

```
Pretendard Variable, Pretendard, system-ui, sans-serif
```

Pretendard on every platform, not just Windows. SEED itself recommends the system font on iOS/Android and Pretendard only on Windows, and this system deliberately departs from that: one face everywhere means one set of metrics to design against, and Korean text renders identically on every device. The cost is real and should be understood — the webfont is served to all users rather than only Windows users, so subset it to KR + Latin, ship `woff2`, and use `font-display: swap`.

- **OpenType features**: `font-variant-numeric: tabular-nums` on prices, totals, and spec tables so digits do not shift width as values change. In a price-comparison product this is functional, not cosmetic.

### Ramps

Sizes and line heights are `rem` (1rem = 16px) so the OS font-size setting is respected. Each `tN` size pairs with the same-numbered `tN` line height.

| Step | Size | Line height | Step | Size | Line height |
|---|---|---|---|---|---|
| `t1` | 0.6875rem (11px) | 0.9375rem (15px) | `t8` | 1.375rem (22px) | 1.875rem (30px) |
| `t2` | 0.75rem (12px) | 1rem (16px) | `t9` | 1.5rem (24px) | 2rem (32px) |
| `t3` | 0.8125rem (13px) | 1.125rem (18px) | `t10` | 1.625rem (26px) | 2.1875rem (35px) |
| `t4` | 0.875rem (14px) | 1.1875rem (19px) | `t11` | 1.75rem (28px) | 2.375rem (38px) |
| `t5` | 1rem (16px) | 1.375rem (22px) | `t12` | 2rem (32px) | 2.625rem (42px) |
| `t6` | 1.125rem (18px) | 1.5rem (24px) | `t13` | 2.5rem (40px) | 3.25rem (52px) |
| `t7` | 1.25rem (20px) | 1.6875rem (27px) | `t14` | 3rem (48px) | 3.75rem (60px) |

A `-static` variant of every step (`{font-size.t4-static}` = `14px`) holds a fixed pixel value for elements whose container height cannot flex — button labels inside fixed-height pills, bottom-nav labels.

Weights: `{font-weight.regular}` 400, `{font-weight.medium}` 500, `{font-weight.bold}` 700.

Per SEED's bands: `t1`–`t5` for body and decorative text, `t6`–`t10` for titles, `t11`–`t14` for large display headings. The app currently tops out at `t9` — `t11`+ is available for desktop display headings but is not in use yet.

### Semantic Styles

| Token | Step | Size / Line height | Weight | Use |
|---|---|---|---|---|
| `{typography.page-title}` | `t9` | 24px / 32px | bold 700 | Page headings (마이페이지, 플래너) |
| `{typography.section-title}` | `t6` | 18px / 24px | bold 700 | Section headings within a page |
| `{typography.card-title}` | `t5` | 16px / 22px | medium 500 | Product name on a card |
| `{typography.body}` | `t5` | 16px / 22px | regular 400 | Default paragraph, input values |
| `{typography.body-sm}` | `t4` | 14px / 19px | regular 400 | Secondary copy, footer, list rows |
| `{typography.body-sm-strong}` | `t4` | 14px / 19px | medium 500 | Emphasis within small copy |
| `{typography.price}` | `t5` | 16px / 22px | medium 500 | The KRW price on a card |
| `{typography.price-sub}` | `t2` | 12px / 16px | regular 400 | Yen sub-price, volume (ml) |
| `{typography.price-discount}` | `t4` | 14px / 19px | medium 500 | Discount rate badge |
| `{typography.button}` | `t4-static` | 14px / 19px | medium 500 | All button labels |
| `{typography.label}` | `t2-static` | 12px / 16px | regular 400 | Bottom-nav labels, chips, badges |
| `{typography.caption}` | `t2` | 12px / 16px | regular 400 | Timestamps, helper text, legal |

### Principles

- **Pick a ramp step, never a loose number.** A size that is not a `tN` step is the most common way a type system drifts. If nothing fits, the design is wrong before the token is.
- **Pair the matching line height.** `t5` size takes `t5` line height. There are no sanctioned exceptions in this system.
- **Three weights, not five.** 400 / 500 / 700. Titles are 700, emphasis and prices are 500, everything else 400. `font-semibold` (600) has no token — it currently appears in 8 places and should resolve to 700.
- **Tracking is `em` and only on titles.** `t9` carries `-0.02em`, `t6`–`t7` carry `-0.01em`, `t5` and below sit at 0. Relative tracking holds proportion when the user scales text; a `px` value does not.
- **`tabular-nums` on every number a user compares.** Prices, discount rates, totals. Non-negotiable in a comparison product.
- **Use `rem`; reach for `-static` only for fixed chrome.** Respecting the OS font-size setting is an accessibility requirement. Every `-static` use should be justifiable by a container that cannot flex.

## Layout

- **Web-first.** Design and review at desktop width first; the single-column phone layout below `sm` is the narrowed fallback. Tailwind is still authored mobile-first (unprefixed base, `sm:`/`md:`/`lg:` enhancements) — that is a syntax convention, not the design target.
- **Page gutter**: `{spacing.xs}` (8px) at phone width, `{spacing.xl}` (24px) at `sm` and up. Cards carry their own internal padding on top.
- **Product grid**: 2 columns at phone width, 3–4 at `sm` and up, gap `{spacing.sm}` (12px).
- **Bottom nav clearance**: below `sm`, every scrollable page ends with `{spacing.bottom-nav-safe}` (5rem) of bottom padding, dropping to `{spacing.lg}` at `sm` where the nav is hidden. Forgetting this is the most common layout bug in this app — the last row of content hides under the nav.
- **Max content width**: 800px for overlays and forms; the product grid is allowed to fill wider viewports.
- **Sticky header**: `{component.header}` is `sticky top-0` at `{z-layer.sticky}`, transparent-bordered until scroll, then a glass hairline on the bottom edge.
- **Grid gap is a single source of truth.** `ProductGrid` is window-virtualized, so the CSS gap and the virtualizer's row-gap constant must be the same number. Both read `ROW_GAP_PX`; changing one without the other misaligns every row below the fold.

### Stacking

Three layers, and nothing shares a level — when everything sat at `z-50`, DOM order silently decided the winner.

| Token | Value | What |
|---|---|---|
| `{z-layer.sticky}` | 30 | Sticky header |
| `{z-layer.nav}` | 40 | Fixed bottom nav |
| `{z-layer.overlay}` | 60 | Modals, bottom sheets, and their backdrops |

**Overlays are portaled to `document.body`.** A `z-index` alone is not enough: `{component.header}` is `position: sticky` with a `z-index`, which creates a stacking context, so any overlay rendered *inside* it is trapped below the bottom nav no matter how high its own `z-index` goes. `{component.modal}` and `{component.bottom-sheet}` both `createPortal` to the body for this reason, guarded by `useMounted()` so SSR renders nothing and hydration stays clean. A new overlay must go through those two components rather than hand-rolling a `fixed inset-0` div.

## Elevation & Depth

Depth comes from **material**, not from shadows. The model follows macOS 26 (Tahoe) Liquid Glass: floating chrome is a translucent layer that lets the content behind it show through, while content itself sits flat on an opaque canvas.

### The glass layer

Glass is for **chrome that floats over scrolling content** — and nothing else. It needs something moving behind it to read as glass; applied to a card on a white canvas it is invisible cost.

| Surface | Material |
|---|---|
| `{component.header}`, `{component.bottom-nav}` | `{glass.tint-light}` + blur, hairline top/bottom edge |
| `{component.modal}`, `{component.bottom-sheet}` | **opaque** panel + blurred `{glass.tint-scrim}` backdrop |
| Dropdowns, popovers, scroller arrows | `{glass.tint-light}` + blur |
| Cards, inputs, buttons, page content | **opaque** — `{colors.canvas}` / `{colors.surface-muted}` |

Overlay *panels* are opaque on purpose: nothing but the scrim sits behind them, so glass would add no depth while cutting the contrast of the secondary text they contain. The glass in an overlay is the **backdrop**, which is exactly where macOS puts it.

The recipe: `background: {glass.tint-light}` · `backdrop-filter: blur({glass.blur}) saturate({glass.saturate})` · a `{glass.hairline}` top border to fake the specular edge · a `{glass.edge}` outer hairline to seat it. The saturate is what separates this from plain glassmorphism — it pulls color up out of the content behind instead of just fogging it.

### Honest limits

- **Refraction is not reproducible in CSS.** `backdrop-filter` cannot displace a pixel, so real Liquid Glass warping of the content behind it is out of reach. We get translucency, blur and saturation — that is the whole budget.
- **Never animate blur.** It re-composites every frame. Animate `opacity` to fade glass in, keep the blur value static.
- **Blur stays at or below `{glass.blur}` (20px)** on full-width surfaces like the header, which repaints on every scroll frame. A larger blur is affordable on a small chip, not on chrome.
- **Always pair glass with an opaque fallback.** Where `backdrop-filter` is unsupported the tint alone must still be legible, so the tint sits at 88% rather than the 12% used in decorative demos.
- **Only `{colors.fg}` goes directly on glass.** Native macOS uses vibrancy, which re-tints text against whatever is behind it; CSS has no equivalent. With dark content scrolling under the chrome, `{colors.fg-muted}` measures as low as 4.0:1 and `{colors.fg-subtle}` 2.5:1 even at a 92% tint. So: primary foreground only on glass, and if secondary text is needed there, put it on an opaque inset (as `{component.search-bar}` does) rather than on the glass itself. This is the reason the tint is 88% and not the 12% of the demos — legibility sets the floor, not aesthetics.

### Shadow

Shadows are a secondary cue, softer and wider than before: overlays carry `0 12px 32px rgb(0 0 0 / 0.12)`. Cards, buttons, inputs and the header carry none — the glass and the hairline do that work.

## Shapes

macOS 26 rounds everything more generously, and radii are **concentric**: a child's radius equals the parent's minus the padding between them, so curves stay parallel instead of crossing.

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 0.5rem (8px) | Chips, badges, small inner images |
| `{rounded.md}` | 0.625rem (10px) | Buttons, inputs, icon buttons, dropdown items |
| `{rounded.lg}` | 1rem (16px) | Product cards, dropdown panels, search bar |
| `{rounded.xl}` | 1.25rem (20px) | Modal panel |
| `{rounded.xxl}` | 1.75rem (28px) | Bottom sheet top corners, hero banner |
| `{rounded.full}` | 9999px | Avatars, pills, filter chips, circular controls |

`{rounded.md}` remains the default for controls. When nesting, subtract the gap: a card at `{rounded.lg}` (16px) with 4px padding takes a 12px inner radius, not another 16px.

## Motion

macOS 26 motion is elastic — things settle rather than stop. Two curves cover it:

- **`{motion.spring}`** (`cubic-bezier(0.34, 1.56, 0.64, 1)`) — overshoots slightly then settles. For elements that *appear*: modals, sheets, popovers, newly inserted rows.
- **`{motion.spring-soft}`** — a gentler overshoot for state changes on existing elements: selection, toggles, hover growth.
- **`{motion.ease-out}`** — no overshoot. For things that *leave*, and for anything where bounce would read as sloppiness (scroll-linked header transitions).

Durations: `{motion.duration-fast}` (180ms) for state flips, `{motion.duration-base}` (280ms) for overlays, `{motion.duration-slow}` (420ms) reserved for large sheets.

Rules:
- Exits are faster than entrances and never overshoot — a bouncing dismissal feels broken.
- Never spring a `width`, `height` or `blur`; spring `transform` and `opacity`, which the compositor handles.
- Respect `prefers-reduced-motion`: drop to a plain opacity fade at `{motion.duration-fast}`.

## Components

**`button-primary`** — The primary action. Background `{colors.primary}`, text `{colors.on-primary}` in `{typography.button}`, `{rounded.md}`, padding 10px × 16px, min-height 44px. Focus: 2px solid `{colors.primary-focus}` outline.

**`button-secondary`** — Background `{colors.canvas}`, text `{colors.fg}`, 1px `{colors.border-strong}` border, otherwise identical to primary. The cancel/dismiss half of a modal's action pair.

**`button-inverse`** — Background `{colors.surface-inverse}`, text `{colors.fg-on-dark}`. For high-emphasis confirmations where orange would read as "promotional" rather than "commit."

**`button-kakao`** — Background `{colors.kakao}`, text `{colors.fg}`. Kakao login only, with the Kakao mark. Vendor-specified; do not restyle.

**`icon-button`** — 32px square, background `{colors.canvas}`, 1px `{colors.border}`, text `{colors.fg}`, `{rounded.md}`. The card bookmark button. **`icon-button-active`** inverts to `{colors.surface-inverse}` / `{colors.fg-on-dark}` for the saved state. Note the 32px visual size sits below the 44px touch minimum — pad the hit area rather than growing the box.

**`header`** — Sticky, `{colors.canvas}`, padding 16px × 8px (24px at `sm`). Logo left, `{component.search-bar}` center (flex-1), nav right. Bottom border is transparent until `window.scrollY > 0`, then `{colors.border-strong}`. At `sm`+ the right side holds inline links (관심 목록, 플래너, auth action); below `sm` those live in `{component.bottom-nav}`.

**`search-bar`** — Background `{colors.surface-sunken}`, placeholder in `{colors.fg-subtle}`, `{rounded.md}`, padding 8px with 32px right inset for the search glyph. It is a `button`, not an `input` — it opens the search modal. Placeholder keywords rotate on a 3s interval with a 200ms fade.

**`bottom-nav`** — Fixed bottom, `{colors.canvas}`, top border `{colors.surface-sunken}`, hidden at `sm` and up. Four items (홈, 관심 목록, 플래너, 마이), each a 24px icon over a `{typography.label}` caption. Active item takes `{colors.primary}`; inactive `{colors.fg}`. `z-50`.

**`product-card`** — The core unit. `{colors.canvas}` background, 1px `{colors.border}`, `{rounded.lg}`, overflow hidden. Top: 1:1 aspect image, `object-contain` (never `cover` — bottle silhouettes must not crop). Bottom: meta panel on `{colors.surface-muted}`, padding 12px × 16px, holding product name in `{typography.card-title}` (truncated), English name in `{typography.body-sm}` / `{colors.fg-muted}`, price in `{typography.price}` with the yen sub-price in `{typography.price-sub}`, and volume in `{typography.price-sub}` / `{colors.fg-muted}`. Overlays on the image: `{component.discount-badge}` bottom-left, `{component.icon-button}` bottom-right.

**`discount-badge`** — Sits on the image's bottom-left corner, background `{colors.canvas}`, text `{colors.primary}` in `{typography.price-discount}`, `border-radius: 0 0.75rem 0 0` so it nests into the card's corner. Rendered only when the discount rate is non-zero.

**`modal`** — Centered overlay. `{colors.canvas}`, `{rounded.md}`, padding 24px, max-width 800px, over `{colors.scrim}` with `backdrop-blur-sm`. Escape closes the top layer only — via `pushEscapeLayer()` / `isTopLayer()` from `lib/escape-stack.ts`.

**`bottom-sheet`** — Bottom-anchored overlay. Same scrim and padding as `{component.modal}`, but `{rounded.xl}` on the top corners only. Below `sm`, prefer this over a centered modal for short action flows (저장하기, 컬렉션 선택) — it is reachable by thumb. At `sm` and up those same flows use `{component.modal}`.

**`input`** — `{colors.canvas}`, text `{colors.fg}` in `{typography.body}`, 1px `{colors.border-strong}`, `{rounded.md}`, padding 10px × 12px, min-height 44px. Focus: 2px `{colors.primary-focus}` outline. **`input-error`** swaps the border to `{colors.danger}` with the message below in `{typography.caption}` / `{colors.danger}`.

**`footer`** — `{colors.surface-footer}`, text `{colors.fg-muted}` in `{typography.body-sm}`, padding 20px, with 80px bottom padding below `sm` to clear the bottom nav.

## Do's and Don'ts

### Do
- Use `{colors.primary}` for the primary action and the discount signal — and let those be the only two orange things on screen.
- Use `{colors.fg-muted}` as the floor for any text a user must read. It is the lightest AA-passing gray in the ramp.
- Reserve `{colors.fg-subtle}` for placeholders and separators.
- Give every interactive element a 44px minimum touch target, padding the hit area if the visual box is smaller.
- Reserve `{spacing.bottom-nav-safe}` at the bottom of every scrollable page below `sm`.
- Use `object-contain` for product imagery.
- Use `tabular-nums` wherever numbers are compared.
- Prefer `{component.bottom-sheet}` over `{component.modal}` for short action flows below `sm`.

### Don't
- Don't introduce a second accent color. Status colors (`{colors.danger}`, `{colors.success}`) are not accents, and `{colors.kakao}` belongs to one button.
- Don't set `{colors.primary}` as small body text on white — 2.38:1 fails AA. Use `{colors.primary-strong}`.
- Don't use `{colors.fg-subtle}` (3.02:1) for content. This is the system's most likely accessibility regression, since `text-gray-400` is currently the app's most-used text color.
- Don't put a shadow on a card, button, or the header. Shadows belong to overlays.
- Don't use `font-semibold` (600) — it has no token; use `{font-weight.bold}`.
- Don't hardcode a hex in a `className`. Add a token instead.
- Don't `object-cover` a bottle image.
- Don't add a second Escape listener without going through `lib/escape-stack.ts`.

## Responsive Behavior

| Breakpoint | Width | Behavior |
|---|---|---|
| `lg` | ≥ 1024px | Reference layout. Content max-width caps; grid stops growing and centers |
| `md` | ≥ 768px | 4-col grid, footer is a single row |
| `sm` | ≥ 640px | 3-col grid, 24px gutter, inline header links, footer padding relaxes |
| Base | < 640px | Narrow fallback. Single column, 2-col product grid, `{component.bottom-nav}` visible, 8px gutter, bottom-nav clearance applied |

Tailwind's default breakpoints; no custom values. Desktop is the reference layout; the rows below `sm` are the narrow fallback, and `sm:`/`md:`/`lg:` prefixes carry the layout back up to it.

## Iteration Guide

1. The orange accent is fixed at #ff8904 and already lives in `app/globals.css` as `--color-brand`. Its four steps exist so each contrast context has a legal option; pick by role, not by eye.
2. Hierarchy is neutrals and weight. Before reaching for a color, try `{colors.fg-muted}` or `{font-weight.medium}`.
3. Sizes come from the `tN` ramp. If the design needs a size that is not a step, fix the design.
4. Borders separate, surfaces group, shadows lift — and only overlays lift.
5. Desktop layout is the real layout. Check any change at 1440px first, then confirm it survives 375px.

## Known Gaps

- **Dark mode is not defined.** The token names are theme-ready (`fg`, `canvas`, `surface-*` rather than `black`/`white`), but no dark values exist and `surface-inverse` is currently a light-mode accent, not a theme.
- **Icons are placeholders.** `BottomNav` and `Header` use `placehold.co` images and inline SVGs; there is no icon token or library choice yet. Sizes in use: 16px (inline) and 24px (nav).
- **No toast component is specified** although the axios interceptor contract in `docs/CONVENTIONS.md` assumes one for 403 and 5xx.
- **Disabled states** are ad-hoc (`disabled:opacity-50`); there is no disabled token pair.
- **Loading/skeleton states** are undefined; `{colors.surface-sunken}` is the intended base.
- **`{typography.page-title}`, `{typography.section-title}`, `{typography.price-sub}`** are defined here but not yet used in code — they describe the target, not the current state.
