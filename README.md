# RR7 Slides

A slideshow application built with React Router 7, TypeScript, and MDX. Features dynamic slide discovery, smooth transitions, and PowerPoint-inspired designs.

## Quick Start

### Prerequisites

- Node.js 22+
- npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd rr7-slides
```

1. Install dependencies:

```bash
npm install
```

1. Start the development server:

```bash
npm run dev
```

1. Open your browser to `http://localhost:5173`

## Usage

### Routes

- **`/`** - Home page with navigation to start slideshow
- **`/slides/{slide-id}`** - Full-screen presentation mode (e.g., `/slides/intro`)

### Navigation Controls

In presentation mode:

- **Left/Right Arrow Keys** - Navigate between slides
- **Navigation buttons** - Click previous/next buttons on screen
- **Slide indicators** - Click dots at bottom to jump to specific slides

### Creating New Slides

1. Create a new `.mdx` file in `app/routes/slides/`
2. Add frontmatter with `title` and `order` fields
3. Write your slide content using MDX:

```mdx
---
title: Your Slide Title
order: 7
---

<div className="h-full flex flex-col justify-center items-center text-center">
  <h1 className="text-7xl font-bold text-white mb-8">Your Slide Title</h1>
  <p className="text-2xl text-gray-300">Your content here</p>
</div>
```

1. The slide will be automatically discovered and added to the presentation

### Slide Structure

Slides are ordered by the `order` field in frontmatter:

- `intro.mdx` (order: 1) - Introduction slide
- `alfa.mdx` (order: 2) - Title & photo layout
- `beta.mdx` (order: 3) - Section title with two columns
- `charlie.mdx` (order: 4) - Photo & content layout
- `delta.mdx` (order: 5) - Key statement
- `end.mdx` (order: 6) - Closing slide

## Architecture

### Project Structure

```text
app/
├── routes/
│   ├── slides/           # MDX slide files
│   ├── home.tsx          # Landing page
│   └── stage.tsx         # Presentation component
├── utils/
│   ├── slide-discovery.ts # Dynamic slide discovery using Vite glob
│   └── slides.server.ts  # Server-side slide navigation
├── types/
│   └── mdx.d.ts          # MDX module type declarations
├── app.css               # Global styles with view transitions
├── root.tsx              # App root component
└── routes.ts             # Route configuration
```

### Key Technologies

- **React Router 7** - File-based routing and SSR
- **MDX** - Markdown with React components
- **TailwindCSS 4** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Slide Discovery System

The application uses Vite's `import.meta.glob` to automatically discover slides:

- Scans `app/routes/slides/*.mdx` files
- Extracts ordering from the `order` field in frontmatter
- Lazy loads slide components for performance
- Caches metadata to avoid repeated discovery

## Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run typecheck  # Type checking (includes React Router type generation)
```

## Deployment

### Docker

A multi-stage Dockerfile is included. Build and run:

```bash
docker build -t rr7-slides .
docker run -p 3000:3000 rr7-slides
```

### Node.js

```bash
npm run build
npm start
```

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using React Router 7, TypeScript, and MDX.
