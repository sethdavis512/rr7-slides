// Dynamic slide discovery using Vite's glob functionality
// Uses import.meta.glob for lazy loading with frontmatter-based ordering

export interface SlideMetadata {
    id: string;
    title: string;
    order: number;
    filename: string;
    component: () => Promise<React.ComponentType>;
}

// Use Vite's glob to discover all MDX slides
const slideModules = import.meta.glob('../routes/slides/*.mdx', { 
    eager: false
});

// Cache for parsed slide metadata
let cachedSlides: SlideMetadata[] | null = null;

// Extract slide ID from filename (e.g., 'intro.mdx' -> 'intro')
function extractSlideId(filePath: string): string {
    const filename = filePath.split('/').pop() || '';
    return filename.replace('.mdx', '');
}

// Parse frontmatter from MDX module
async function parseSlideFrontmatter(moduleLoader: () => Promise<any>): Promise<{ title: string; order: number }> {
    try {
        const module = await moduleLoader();
        // Extract frontmatter from the MDX module
        const frontmatter = (module as any)?.frontmatter || {};
        return {
            title: frontmatter.title || 'Untitled Slide',
            order: frontmatter.order || 0
        };
    } catch (error) {
        console.warn('Failed to parse slide frontmatter:', error);
        return {
            title: 'Untitled Slide',
            order: 0
        };
    }
}

// Discover and parse all slides with frontmatter
export async function discoverSlides(): Promise<SlideMetadata[]> {
    if (cachedSlides) {
        return cachedSlides;
    }

    const slides: SlideMetadata[] = [];

    for (const [filePath, moduleLoader] of Object.entries(slideModules)) {
        const slideId = extractSlideId(filePath);
        const { title, order } = await parseSlideFrontmatter(moduleLoader);

        slides.push({
            id: slideId,
            title,
            order,
            filename: filePath.split('/').pop() || '',
            component: async () => {
                const module = await moduleLoader();
                return (module as any).default;
            }
        });
    }

    // Sort by frontmatter order field
    slides.sort((a, b) => a.order - b.order);

    // Cache the results
    cachedSlides = slides;
    return slides;
}

// Get slide metadata by ID
export async function getSlideMetadata(slideId: string): Promise<SlideMetadata | null> {
    const slides = await discoverSlides();
    return slides.find(slide => slide.id === slideId) || null;
}

// Get all slide IDs in order
export async function getAllSlideIds(): Promise<string[]> {
    const slides = await discoverSlides();
    return slides.map(slide => slide.id);
}

// Get slide component by ID
export async function getSlideComponent(slideId: string): Promise<React.ComponentType | null> {
    const metadata = await getSlideMetadata(slideId);
    if (!metadata) return null;
    
    try {
        return await metadata.component();
    } catch (error) {
        console.error(`Failed to load slide component for ${slideId}:`, error);
        return null;
    }
}


// Get first slide ID
export async function getFirstSlideId(): Promise<string> {
    const slides = await discoverSlides();
    return slides[0]?.id || '';
}

