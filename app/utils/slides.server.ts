// Server-side slide configuration using dynamic discovery
// This file runs only on the server, keeping client bundle minimal

import { discoverSlides, getSlideMetadata, getAllSlideIds as getAllSlideIdsFromDiscovery, getFirstSlideId as getFirstSlideIdFromDiscovery } from './slide-discovery';

export interface SlideConfig {
    id: string;
    title: string;
    order: number;
    filename: string;
}

export interface SlideNavigation {
    slideId: string;
    currentIndex: number;
    totalSlides: number;
    nextSlide: string | null;
    prevSlide: string | null;
    title: string;
}


// Server-side slide resolution - runs at request time
export async function getSlideNavigation(slideId: string): Promise<SlideNavigation> {
    const allSlideIds = await getAllSlideIdsFromDiscovery();
    const currentIndex = allSlideIds.indexOf(slideId);

    if (currentIndex === -1) {
        // Invalid slide, return first slide data
        const firstSlideId = await getFirstSlideIdFromDiscovery();
        const firstSlideMetadata = await getSlideMetadata(firstSlideId);
        
        return {
            slideId: firstSlideId,
            currentIndex: 0,
            totalSlides: allSlideIds.length,
            nextSlide: allSlideIds[1] || null,
            prevSlide: null,
            title: firstSlideMetadata?.title || 'Untitled Slide'
        };
    }

    const slideMetadata = await getSlideMetadata(slideId);

    return {
        slideId,
        currentIndex,
        totalSlides: allSlideIds.length,
        nextSlide: allSlideIds[currentIndex + 1] || null,
        prevSlide: allSlideIds[currentIndex - 1] || null,
        title: slideMetadata?.title || 'Untitled Slide'
    };
}

// Check if a slide exists
export async function slideExists(slideId: string): Promise<boolean> {
    const metadata = await getSlideMetadata(slideId);
    return metadata !== null;
}

// Get first slide ID
export async function getFirstSlideId(): Promise<string> {
    return await getFirstSlideIdFromDiscovery();
}

// Get all slide IDs in order for navigation
export async function getAllSlideIds(): Promise<string[]> {
    return await getAllSlideIdsFromDiscovery();
}

