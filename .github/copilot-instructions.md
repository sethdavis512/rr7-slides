# RR7-Slides AI Coding Instructions

This is a **React Router 7 slideshow application** built with TypeScript, MDX, and TailwindCSS for creating PowerPoint-style presentations.

## Architecture Overview

- **React Router 7**: File-based routing with SSR enabled by default (`react-router.config.ts`)
- **MDX Slides**: Presentation content lives in `app/routes/slides/*.mdx` with frontmatter metadata
- **Dynamic Discovery**: Vite's `import.meta.glob` automatically finds and orders slides by filename prefix (`01-`, `02-`, etc.)
- **Presentation Mode**: Full-screen slides at `/slides/{slideId}` with keyboard navigation (arrows, spacebar)

## Key Components & Patterns

### Slide Discovery System (`app/utils/slide-discovery.ts`)

- Uses `import.meta.glob('../routes/slides/*.mdx', { eager: false })` for lazy loading
- Extracts order from filename prefixes or falls back to alphabetical
- Caches slide metadata in `cachedSlides` to avoid repeated discovery
- Provides navigation helpers: `getNextSlideId()`, `getPreviousSlideId()`

### Presentation Controller (`app/routes/stage.tsx`)

- Dynamic imports slide components using `importSlide(slideId)`
- Handles keyboard navigation via `useEffect` with event listeners
- Uses `Suspense` for loading states during component imports
- Redirects invalid slide IDs to first slide

### MDX Configuration (`vite.config.ts`)

- Configured with `remarkFrontmatter` and `remarkMdxFrontmatter` plugins
- TypeScript definitions in `app/types/mdx.d.ts`
- Slides support frontmatter with `title` field

## Development Workflows

**Creating New Slides:**

1. Add `.mdx` file to `app/routes/slides/` with numeric prefix (e.g., `07-new-topic.mdx`)
2. Include frontmatter: `---\ntitle: Slide Title\n---`
3. Use TailwindCSS classes for PowerPoint-inspired layouts
4. Slide auto-discovered on next navigation

**Key Commands:**

- `npm run dev` - Vite dev server with hot reload
- `npm run typecheck` - React Router type generation + TypeScript check
- `npm run build` - Production build with SSR

## Slide Layout Patterns

### Full-Screen Container

```jsx
<div className="h-full flex flex-col justify-center items-center text-center relative">
```

### Responsive Padding (matches `stage.tsx`)

```jsx
<div className="px-32 py-16 pb-32 xl:px-24 md:px-16">
```

### Typography Scale

- Main titles: `text-7xl md:text-8xl lg:text-9xl`
- Subtitles: `text-2xl md:text-3xl`
- Body text: `text-xl`

### Brand Colors

- Primary accent: `bg-blue-500`, `text-blue-500`
- Dark theme: `bg-gray-900` background, `text-white` primary text
- Secondary text: `text-gray-300`, `text-gray-400`

## File Naming Conventions

- Slides: `{order}-{name}.mdx` (e.g., `01-intro.mdx`, `02-alfa.mdx`)
- Routes follow React Router 7 conventions in `app/routes.ts`
- Home route at index, stage at `slides/:slideId`

## Integration Points

- **Slide Navigation**: Update `app/routes/home.tsx` link targets when changing slide structure
- **Styling**: Global styles in `app/app.css`, component styles via TailwindCSS utilities
- **Assets**: Static files in `public/`, images in `app/images/`
- **Type Safety**: MDX modules typed via `app/types/mdx.d.ts`

When adding features, respect the lazy-loading architecture and maintain the numeric ordering system for predictable slide sequences.
