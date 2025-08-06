// Server-only slide configuration
// This file runs only on the server, keeping client bundle minimal

export interface SlideConfig {
  id: string;
  title: string;
  order: number;
  filename: string;
}

// Static slide configuration - no runtime discovery needed
export const SLIDES_CONFIG: Record<string, SlideConfig> = {
  intro: { id: 'intro', title: 'Introduction', order: 0, filename: '01-intro.mdx' },
  alfa: { id: 'alfa', title: 'Alpha Features', order: 1, filename: '02-alfa.mdx' },
  beta: { id: 'beta', title: 'Beta Release', order: 2, filename: '03-beta.mdx' },
  charlie: { id: 'charlie', title: 'Charlie Updates', order: 3, filename: '04-charlie.mdx' },
  delta: { id: 'delta', title: 'Delta Changes', order: 4, filename: '05-delta.mdx' },
  end: { id: 'end', title: 'Conclusion', order: 5, filename: '06-end.mdx' },
} as const;

// Ordered list of slide IDs for navigation
export const SLIDE_ORDER = Object.keys(SLIDES_CONFIG).sort(
  (a, b) => SLIDES_CONFIG[a].order - SLIDES_CONFIG[b].order
);

export interface SlideNavigation {
  slideId: string;
  currentIndex: number;
  totalSlides: number;
  nextSlide: string | null;
  prevSlide: string | null;
  title: string;
}

// Server-side slide resolution - runs at request time
export function getSlideNavigation(slideId: string): SlideNavigation {
  const currentIndex = SLIDE_ORDER.indexOf(slideId);
  
  if (currentIndex === -1) {
    // Invalid slide, return first slide data
    const firstSlideId = SLIDE_ORDER[0];
    return {
      slideId: firstSlideId,
      currentIndex: 0,
      totalSlides: SLIDE_ORDER.length,
      nextSlide: SLIDE_ORDER[1] || null,
      prevSlide: null,
      title: SLIDES_CONFIG[firstSlideId].title,
    };
  }

  return {
    slideId,
    currentIndex,
    totalSlides: SLIDE_ORDER.length,
    nextSlide: SLIDE_ORDER[currentIndex + 1] || null,
    prevSlide: SLIDE_ORDER[currentIndex - 1] || null,
    title: SLIDES_CONFIG[slideId].title,
  };
}

// Check if a slide exists
export function slideExists(slideId: string): boolean {
  return slideId in SLIDES_CONFIG;
}

// Get first slide ID
export function getFirstSlideId(): string {
  return SLIDE_ORDER[0];
}

// Get all slide IDs in order for navigation
export function getAllSlideIds(): string[] {
  return [...SLIDE_ORDER];
}
