# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # Development server with hot reload
npm run build      # Production build
npm start          # Start production server
npm run typecheck  # Type checking (includes React Router type generation)
```

## Architecture Overview

A **React Router 7 slideshow application** with dynamic slide discovery, frontmatter-controlled ordering, and server-side rendering with client-side lazy loading.

### How It Works

1. MDX slides live in `app/routes/slides/*.mdx`, each with `title`, `order`, and `transition` frontmatter
2. `import.meta.glob()` discovers all slides at build time with lazy loading
3. The gallery page (`/`) shows available themes; each links to `/:themeId/slides/intro`
4. The server loader validates the theme + slide ID, computes navigation, and returns it
5. The stage route applies `data-theme` on its container, which swaps all CSS custom properties (fonts + colors)
6. The client lazily loads the matching MDX component and renders it full-screen
7. Navigation happens via React Router Links with `viewTransition` for animated transitions

### Core Files

| File | Purpose |
|------|---------|
| `app/app.css` | Design tokens (OKLCH colors, fonts), theme definitions, view transition keyframes |
| `app/root.tsx` | HTML shell, font loading for all themes via Google Fonts |
| `app/routes.ts` | Route config: index (`/`) and `:themeId/slides/:slideId` |
| `app/routes/stage.tsx` | Main presentation route -- loader, navigation, keyboard handling, slide wrapper |
| `app/utils/slide-discovery.ts` | Dynamic slide discovery using Vite glob with frontmatter parsing |
| `app/utils/slides.server.ts` | Server-side slide navigation and validation (re-exports from discovery) |
| `app/routes/slides/*.mdx` | Individual slide content |
| `vite.config.ts` | MDX plugin config with `remarkFrontmatter` and `remarkMdxFrontmatter` |
| `react-router.config.ts` | SSR enabled |

### Adding a New Slide

1. Create `app/routes/slides/my-slide.mdx`
2. Add frontmatter:
   ```yaml
   ---
   title: My Slide
   order: 7
   transition: depth
   ---
   ```
3. Write content using JSX in MDX. Use the design tokens (see below).
4. The slide is automatically discovered and ordered by its `order` value.

File names are descriptive (e.g., `intro.mdx`, `delta.mdx`) -- ordering comes from frontmatter, not filenames.

### Existing Slide Layouts

| File | Layout | Alignment |
|------|--------|-----------|
| `intro.mdx` | Title slide (heading + subtitle + author) | Centered |
| `alfa.mdx` | Text (3/5) + photo placeholder (2/5) | Left-aligned text |
| `beta.mdx` | Section header + two-column content | Left-aligned |
| `charlie.mdx` | Photo placeholder (2/5) + text (3/5) | Left-aligned text |
| `delta.mdx` | Big number / key statement | Centered |
| `end.mdx` | Thank you + contact grid | Centered |

## Design System

### Themes

Three built-in themes, each defining its own fonts + OKLCH color palette. Applied via `data-theme` attribute on the stage container. The gallery page (`/`) lets users pick a theme.

| Theme | Personality | Display Font | Body Font | Accent Hue | Neutral Tint |
|-------|-------------|-------------|-----------|------------|--------------|
| `ink` | Quiet luxury, refined | Instrument Serif | Outfit | 250 (blue) | Cool blue |
| `warm` | Editorial, organic | Fraunces | DM Sans | 55 (terracotta) | Warm cream |
| `sharp` | Brutalist, high-contrast | Space Grotesk | Space Grotesk | 25 (red) | Near-neutral |

URL structure: `/:themeId/slides/:slideId` (e.g., `/warm/slides/intro`)

#### Adding a New Theme

1. Add a `[data-theme='your-theme']` block in `app/app.css` defining all `--_*` variables (fonts + colors)
2. Add a matching `@media (prefers-color-scheme: dark)` variant
3. Add the theme ID to `VALID_THEMES` in `app/routes/stage.tsx`
4. Add an entry to the `themes` array in `app/routes/home.tsx`
5. Load any new fonts in `app/root.tsx`

### Typography

Fonts are theme-dependent. `font-display` and `font-body` resolve to CSS custom properties that each theme defines. All fonts loaded from Google Fonts in `app/root.tsx`.

Headings use fluid sizing via `clamp()`:
```
text-[clamp(3.5rem,6vw+1rem,8rem)]   /* Hero titles */
text-[clamp(2.5rem,4vw+0.5rem,4.5rem)] /* Slide titles */
text-[clamp(1.25rem,2vw,2rem)]        /* Subtitles */
text-[clamp(1rem,1.2vw+0.25rem,1.25rem)] /* Body */
```

### Color Tokens

All colors use OKLCH. Each theme defines its own palette with tinted neutrals. Defined as CSS custom properties in `app/app.css`, exposed as Tailwind utilities via `@theme`.

| Utility | Role |
|---------|------|
| `bg-surface` / `text-surface` | Page background |
| `bg-surface-raised` | Elevated surfaces (cards, image placeholders) |
| `text-ink` | Primary text |
| `text-ink-secondary` | Secondary text, subtitles, body |
| `text-ink-tertiary` | Tertiary text, captions, metadata |
| `bg-accent` / `text-accent` | Accent color (theme-dependent) -- use sparingly |
| `bg-accent-dim` | Accent at 8-10% opacity for subtle backgrounds |
| `border-rule` | Borders and dividers |

**Do not use raw Tailwind color classes** (`text-white`, `bg-gray-900`, `text-blue-500`). Always use the semantic tokens above.

### Theming

Light and dark themes switch automatically via `prefers-color-scheme`. Both are defined with OKLCH custom properties in `app/app.css`:

- Light: `--_surface: oklch(97% ...)`, dark ink
- Dark: `--_surface: oklch(13% ...)`, light ink, slightly desaturated accent

The private `--_*` variables hold the actual OKLCH values. The `@theme` block maps them to `--color-*` so Tailwind generates utilities. To adjust a color, edit the OKLCH values in the `:root` or `@media (prefers-color-scheme: dark)` blocks.

### View Transitions

Slide navigation uses the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) via React Router's `viewTransition` prop. Each slide controls its own entrance transition via frontmatter.

**How it works:**

1. Each slide declares `transition: depth|fade|lift|zoom|flip|none` in frontmatter
2. The server loader builds a `transitionMap` (slideId -> transition) and sends it to the client
3. Before navigating, `stage.tsx` sets two data attributes on `<html>`:
   - `data-nav="forward|back"` (direction)
   - `data-transition="depth|fade|lift|zoom|flip|none"` (the *destination* slide's transition)
4. React Router wraps the DOM update in `document.startViewTransition()`
5. CSS in `app/app.css` selects on both attributes to pick the right keyframes
6. `::view-transition-*(root)` animations are disabled so nav chrome stays static

**Reduced motion:** The entire transition block is wrapped in `@media (prefers-reduced-motion: no-preference)`. When reduced motion is preferred, navigation is instant with no animation.

**Timing:** All transitions use `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo). Exit is faster (0.35s) than entrance (0.65s) for a snappy feel. The `flip` transition uses equal 0.5s for both.

#### Available Transitions

Set via `transition` in slide frontmatter. Defaults to `depth` if omitted.

| Value | Effect | Best for |
|-------|--------|----------|
| `depth` | Recedes with blur + scale, emerges from opposite side. Directional. | Content slides, general purpose |
| `fade` | Clean crossfade. No movement, no scale. | Title slides, closing slides, calm moments |
| `lift` | Lifts up and away, new rises from below. Like a card stack. Directional. | Section transitions, new topics |
| `zoom` | Zooms in and fades out, new fades in at normal scale. Directional (reverses on back). | Key statements, drilling into detail, emphasis |
| `flip` | 3D card flip along the Y axis. Directional. | Dramatic reveals, before/after comparisons |
| `none` | Instant cut. No animation. | When you want punch, or rapid-fire content |

#### Adding a New Transition

1. Choose a name (lowercase, no spaces)
2. Add it to `SlideTransition` union type in `app/utils/slide-discovery.ts`
3. Add it to the `VALID_TRANSITIONS` array in the same file
4. Add CSS keyframes and selectors in `app/app.css` following the existing pattern:
   - `html[data-transition='your-name']::view-transition-old(slide)` for exit
   - `html[data-transition='your-name']::view-transition-new(slide)` for enter
   - Add `[data-nav='back']` variants for directional transitions
5. Use it in any slide: `transition: your-name`

### Navigation

- **Keyboard:** Left/Right arrows
- **UI:** Previous/next arrow links (sides), dot indicators (bottom), slide counter (top-right)
- All navigation uses React Router `<Link>` with `prefetch="intent"` and `viewTransition`
- Invalid slide IDs redirect to the first slide via server-side 302

## Conventions

### Slide Content

- Use `font-display` only on the primary heading of each slide
- Use semantic color tokens, never raw Tailwind colors
- Left-align text-heavy slides; reserve center alignment for title/statement/closing slides
- Use spacing and typography for hierarchy, not borders, badges, or decorative elements
- Constrain text width with `max-w-[50ch]` or similar for readability
- Photo layouts use asymmetric splits (`flex-[3]` / `flex-[2]`), not 50/50

### Code Style

- Route types imported from `./+types/<route-name>` (auto-generated)
- Server logic in `*.server.ts` files
- Tailwind utility classes directly in markup, no CSS modules or `@apply`

## Design Context

### Users
General-purpose presentation tool for any audience -- conference talks, team meetings, client pitches, workshops. Slides are projected or screen-shared, so clarity at a distance matters.

### Brand Personality
**Clean, refined, modern.** Calm confidence without being cold. Spacious and restrained, but not sterile -- a sense of craft and intentionality in every detail. "Quiet luxury" applied to slide design.

### Design Principles

1. **Clarity over decoration.** Every element earns its place. If it doesn't aid comprehension or set tone, remove it.
2. **Typography is the design.** Size, weight, and spacing communicate hierarchy -- not borders, backgrounds, or icons.
3. **Breathe.** Generous whitespace signals confidence. Crowded slides signal anxiety.
4. **One accent, used with intent.** Blue is the punctuation mark, not the paragraph. Draw the eye to exactly one thing per slide.
5. **Light and dark as equals.** Both themes feel native, not derived. Design for both from the start.

### Anti-references
Busy corporate templates, clip-art energy, over-decorated slides, rainbow color palettes, generic AI-generated dark-mode-with-blue-accents aesthetic.
