# RR7 Slides

A modern, professional slideshow application built with React Router 7, TypeScript, and MDX. Features dynamic slide discovery, smooth transitions, and PowerPoint-inspired designs.

## ✨ Features

- 📊 **Professional Slide Designs** - PowerPoint-inspired layouts with modern styling
- 🎬 **Smooth Transitions** - Loading states and component transitions
- 📝 **MDX Support** - Write slides in Markdown with React components
- 🔄 **Dynamic Discovery** - Automatic slide detection and ordering
- ⌨️ **Keyboard Navigation** - Left/Right arrow key controls
- 📱 **Responsive Design** - Optimized for different screen sizes
- 🚀 **Performance** - Lazy loading and component caching
- 🎨 **TailwindCSS** - Atomic CSS for consistent styling
- 🔒 **TypeScript** - Full type safety throughout

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

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

## 📖 Usage

### Viewing Slides

The application provides two main routes:

- **`/`** - Home page with navigation to start slideshow
- **`/slides/{slide-id}`** - Full-screen presentation mode (e.g., `/slides/01-intro`)

### Navigation Controls

In presentation mode (`/slides/{slide-id}`):

- **Left/Right Arrow Keys** - Navigate between slides
- **Navigation buttons** - Click previous/next buttons on screen
- **Slide indicators** - Click dots at bottom to jump to specific slides

### Creating New Slides

1. Create a new `.mdx` file in `app/routes/slides/`
2. Use numeric prefixes for ordering: `07-new-slide.mdx`
3. Write your slide content using MDX:

```mdx
# Your Slide Title

Write your slide content using Markdown and React components.

<div className="text-center">
  Custom React components work here!
</div>
```

1. The slide will be automatically discovered and added to the presentation

### Slide Structure

Slides are organized with the following naming convention:

- `01-intro.mdx` - Introduction slide
- `02-alfa.mdx` - First content slide
- `03-beta.mdx` - Second content slide
- `04-charlie.mdx` - Third content slide
- `05-delta.mdx` - Fourth content slide
- `06-end.mdx` - Closing slide

## 🏗️ Architecture

### Project Structure

```text
app/
├── routes/
│   ├── slides/           # MDX slide files (01-intro.mdx, 02-alfa.mdx, etc.)
│   ├── home.tsx          # Landing page
│   └── stage.tsx         # Presentation component
├── utils/
│   ├── slide-discovery.ts # Auto-discovery logic
│   └── common.ts         # Shared utilities (currently minimal)
├── types/                # TypeScript definitions
├── images/               # Static assets
├── app.css              # Global styles
├── root.tsx             # App root component
└── routes.ts            # Route configuration
```

### Key Technologies

- **React Router 7** - File-based routing and SSR
- **MDX** - Markdown with React components
- **TailwindCSS** - Utility-first CSS framework

- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server

### Slide Discovery System

The application uses Vite's `import.meta.glob` to automatically discover slides:

- Scans `app/routes/slides/*.mdx` files
- Extracts ordering from filename prefixes (`01-`, `02-`, etc.)
- Lazy loads slide components for performance
- Caches metadata to avoid repeated discovery

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck
```

### Customizing Slide Designs

Slides use TailwindCSS classes for styling. Key design patterns:

- **Full-screen layouts** - `w-screen h-screen`
- **Responsive padding** - `px-32 py-16 pb-32 xl:px-24 md:px-16`
- **Professional typography** - `text-7xl to text-9xl` for titles
- **Color schemes** - Blue accents with high contrast
- **Geometric elements** - Decorative shapes for visual interest

### Adding Custom Components

You can create reusable components for slides:

```tsx
// app/components/CodeBlock.tsx
export function CodeBlock({
    children,
    language
}: {
    children: string;
    language: string;
}) {
    return (
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg">
            <code className={`language-${language}`}>{children}</code>
        </pre>
    );
}
```

Then use in MDX:

```mdx
import { CodeBlock } from '../components/CodeBlock';

# My Slide

<CodeBlock language="javascript">console.log('Hello, World!');</CodeBlock>
```

## 🚀 Production Deployment

### Build Process

```bash
npm run build
```

This creates:

- `build/client/` - Static assets for the browser
- `build/server/` - Server-side code for SSR

### Deployment Options

**Node.js Server:**

```bash
npm start
```

**Static Hosting:**
The app supports static export for platforms like Netlify, Vercel, or GitHub Pages.

**Docker:**
Create a Dockerfile for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Build and run with Docker:**

```bash
docker build -t rr7-slides .
docker run -p 3000:3000 rr7-slides
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help with the slideshow application, please open an issue on GitHub.

---

Built with ❤️ using React Router 7, TypeScript, and MDX.
