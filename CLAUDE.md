# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking (includes React Router type generation)
npm run typecheck
```

## Architecture Overview

This is a **React Router 7 slideshow application** with **dynamic slide discovery** using Vite's glob functionality and **frontmatter-controlled ordering**. The architecture uses server-side rendering with client-side lazy loading.

### Key Components

- **Dynamic Slide Discovery**: Uses `import.meta.glob()` to automatically discover slides with lazy loading
- **Frontmatter Ordering**: Slide order controlled by `order` field in MDX frontmatter
- **Server-Side Navigation**: All slide resolution happens on the server via loaders  
- **MDX Content**: Slides are written in MDX format in `app/routes/slides/*.mdx`
- **React Router 7**: File-based routing with SSR enabled by default

### Core Files

- `app/utils/slide-discovery.ts` - Dynamic slide discovery using Vite glob with frontmatter parsing
- `app/utils/slides.server.ts` - Server-side slide navigation and validation (uses discovery system)
- `app/routes/stage.tsx` - Main presentation route with dynamic imports and Suspense
- `app/routes.ts` - Route configuration (index and slides/:slideId)
- `react-router.config.ts` - SSR enabled
- `vite.config.ts` - MDX configuration with frontmatter support

### Slide Structure

Slides use frontmatter for metadata:
```yaml
---
title: Slide Title
order: 1
---
```

- **File naming**: Descriptive names without numeric prefixes (e.g., `intro.mdx`, `conclusion.mdx`)
- **Ordering**: Controlled by `order` field in frontmatter, not filename
- **Discovery**: Automatic via `import.meta.glob('../routes/slides/*.mdx')`

### Adding New Slides

1. Create new `.mdx` file in `app/routes/slides/` with descriptive name
2. Add frontmatter with `title` and `order` fields
3. Write slide content using MDX
4. Slide automatically discovered and ordered by frontmatter

### Dynamic Loading Architecture

- **Lazy Loading**: Components loaded on-demand using dynamic imports
- **Suspense**: Loading states handled with React Suspense boundaries
- **Caching**: Slide metadata cached after first discovery
- **Error Handling**: Graceful fallbacks for missing slides or load failures

### Slide Layout Patterns

Slides use full-screen layouts with responsive padding:
- Container: `px-32 py-16 pb-32 xl:px-24 md:px-16 h-full flex items-center justify-center`
- Typography: Main titles use `text-7xl md:text-8xl lg:text-9xl`
- Brand colors: Blue accent (`bg-blue-500`), dark theme (`bg-gray-900`)

### Navigation

- **Keyboard**: Left/Right arrows for navigation
- **UI**: Previous/next buttons and slide indicators
- **All navigation uses React Router Links with prefetching**
- **Server-side slide validation with redirects for invalid slides**

### Brooks Rules Compliance

- ✅ Uses proper `./+types/stage` import pattern for route types
- ✅ Maintains server-side loader pattern with async operations
- ✅ Uses descriptive, clear filenames without routing constraints
- ✅ Leverages automatic type generation (`npm run typecheck`)
- ✅ Follows React Router 7 best practices

### MDX Configuration

- Configured with `remarkFrontmatter` and `remarkMdxFrontmatter` plugins
- TypeScript definitions in `app/types/mdx.d.ts`
- Frontmatter supports `title` and `order` fields for slide metadata