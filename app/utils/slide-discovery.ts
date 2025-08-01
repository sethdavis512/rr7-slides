export interface SlideMetadata {
    id: string;
    title?: string;
    order: number;
    filename: string;
    component: () => Promise<{ default: React.ComponentType }>;
}

// Automatically discover all MDX slides using Vite's import.meta.glob
const slideModules = import.meta.glob('../routes/slides/*.mdx', { eager: false });

// Parse slide metadata from filenames and frontmatter
export async function discoverSlides(): Promise<SlideMetadata[]> {
    const slides: SlideMetadata[] = [];
    
    for (const [path, importFn] of Object.entries(slideModules)) {
        const filename = path.split('/').pop()!;
        const id = filename.replace('.mdx', '');
        
        // Try to extract order from filename (e.g., "01-intro.mdx" -> order: 1)
        // or fallback to alphabetical order
        let order = 0;
        const orderMatch = filename.match(/^(\d+)[-_]/);
        if (orderMatch) {
            order = parseInt(orderMatch[1], 10);
        } else {
            // Fallback: use alphabetical order
            order = filename.charCodeAt(0);
        }
        
        slides.push({
            id,
            filename,
            order,
            component: importFn as () => Promise<{ default: React.ComponentType }>
        });
    }
    
    return slides.sort((a, b) => a.order - b.order);
}

// Cache slides to avoid repeated discovery
let cachedSlides: SlideMetadata[] | null = null;

export async function getSlides(): Promise<SlideMetadata[]> {
    if (!cachedSlides) {
        cachedSlides = await discoverSlides();
    }
    return cachedSlides;
}

// Get slide by ID
export async function getSlideById(slideId: string): Promise<SlideMetadata | undefined> {
    const slides = await getSlides();
    return slides.find(s => s.id === slideId);
}

// Import a specific slide component
export async function importSlide(slideId: string) {
    const slide = await getSlideById(slideId);
    if (!slide) {
        throw new Error(`Slide ${slideId} not found`);
    }
    
    const module = await slide.component();
    return module.default;
}

// Get navigation slide IDs
export async function getNavigationSlideIds(currentSlideId: string): Promise<{ next: string | null; previous: string | null }> {
    const slides = await getSlides();
    const currentIndex = slides.findIndex(s => s.id === currentSlideId);
    
    if (currentIndex === -1) {
        return { next: null, previous: null };
    }
    
    return {
        next: currentIndex < slides.length - 1 ? slides[currentIndex + 1].id : null,
        previous: currentIndex > 0 ? slides[currentIndex - 1].id : null
    };
}

// Legacy functions for backward compatibility
export async function getNextSlideId(currentSlideId: string): Promise<string | null> {
    const { next } = await getNavigationSlideIds(currentSlideId);
    return next;
}

export async function getPreviousSlideId(currentSlideId: string): Promise<string | null> {
    const { previous } = await getNavigationSlideIds(currentSlideId);
    return previous;
}
