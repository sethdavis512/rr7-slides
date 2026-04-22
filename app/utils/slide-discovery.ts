// Dynamic slide discovery using Vite's glob functionality.
// Slides are eagerly imported so they render synchronously during view
// transitions (avoids a flash of "Loading..." between slides).

export type SlideTransition =
    | 'depth'
    | 'fade'
    | 'lift'
    | 'zoom'
    | 'flip'
    | 'none';

export interface SlideMetadata {
    id: string;
    title: string;
    order: number;
    transition: SlideTransition;
    filename: string;
    Component: React.ComponentType;
}

interface MDXModule {
    default: React.ComponentType;
    frontmatter?: { title?: string; order?: number; transition?: string };
}

// Eagerly import all MDX slides. They're small and need to be parsed at
// startup anyway to read frontmatter — eager loading keeps navigation
// instantaneous and avoids a render cycle showing a loading placeholder.
const slideModules = import.meta.glob<MDXModule>('../routes/slides/*.mdx', {
    eager: true
});

const VALID_TRANSITIONS: SlideTransition[] = [
    'depth',
    'fade',
    'lift',
    'zoom',
    'flip',
    'none'
];

function extractSlideId(filePath: string): string {
    const filename = filePath.split('/').pop() || '';
    return filename.replace('.mdx', '');
}

function buildSlides(): SlideMetadata[] {
    const slides: SlideMetadata[] = [];

    for (const [filePath, module] of Object.entries(slideModules)) {
        const frontmatter = module.frontmatter ?? {};
        const rawTransition = frontmatter.transition ?? 'depth';
        const transition = VALID_TRANSITIONS.includes(
            rawTransition as SlideTransition
        )
            ? (rawTransition as SlideTransition)
            : 'depth';

        slides.push({
            id: extractSlideId(filePath),
            title: frontmatter.title || 'Untitled Slide',
            order: frontmatter.order ?? 0,
            transition,
            filename: filePath.split('/').pop() || '',
            Component: module.default
        });
    }

    slides.sort((a, b) => a.order - b.order);
    return slides;
}

const slides = buildSlides();
const slidesById = new Map(slides.map((s) => [s.id, s]));

export function discoverSlides(): SlideMetadata[] {
    return slides;
}

export function getSlideMetadata(slideId: string): SlideMetadata | null {
    return slidesById.get(slideId) ?? null;
}

export function getAllSlideIds(): string[] {
    return slides.map((slide) => slide.id);
}

export function getSlideComponent(
    slideId: string
): React.ComponentType | null {
    return slidesById.get(slideId)?.Component ?? null;
}

export function getFirstSlideId(): string {
    return slides[0]?.id || '';
}
