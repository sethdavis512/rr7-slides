// Server-side slide configuration using dynamic discovery
// This file runs only on the server, keeping client bundle minimal

import {
    getSlideMetadata,
    getAllSlideIds,
    getFirstSlideId,
    discoverSlides
} from './slide-discovery';
import type { SlideTransition } from './slide-discovery';

export type { SlideTransition };
export { getAllSlideIds, getFirstSlideId };

export interface SlideNavigation {
    slideId: string;
    currentIndex: number;
    totalSlides: number;
    nextSlide: string | null;
    prevSlide: string | null;
    title: string;
    transition: SlideTransition;
    /** Map of slideId -> transition for all slides, so the client can look up the target slide's transition before navigating */
    transitionMap: Record<string, SlideTransition>;
}

// Server-side slide resolution - runs at request time
export async function getSlideNavigation(
    slideId: string
): Promise<SlideNavigation> {
    const allSlides = await discoverSlides();
    const allSlideIds = allSlides.map((s) => s.id);
    const transitionMap: Record<string, SlideTransition> = {};
    for (const slide of allSlides) {
        transitionMap[slide.id] = slide.transition;
    }

    const currentIndex = allSlideIds.indexOf(slideId);

    if (currentIndex === -1) {
        const firstSlideId = await getFirstSlideId();
        const firstSlideMetadata = await getSlideMetadata(firstSlideId);

        return {
            slideId: firstSlideId,
            currentIndex: 0,
            totalSlides: allSlideIds.length,
            nextSlide: allSlideIds[1] || null,
            prevSlide: null,
            title: firstSlideMetadata?.title || 'Untitled Slide',
            transition: firstSlideMetadata?.transition || 'depth',
            transitionMap
        };
    }

    const slideMetadata = await getSlideMetadata(slideId);

    return {
        slideId,
        currentIndex,
        totalSlides: allSlideIds.length,
        nextSlide: allSlideIds[currentIndex + 1] || null,
        prevSlide: allSlideIds[currentIndex - 1] || null,
        title: slideMetadata?.title || 'Untitled Slide',
        transition: slideMetadata?.transition || 'depth',
        transitionMap
    };
}

// Check if a slide exists
export async function slideExists(slideId: string): Promise<boolean> {
    const metadata = await getSlideMetadata(slideId);
    return metadata !== null;
}
