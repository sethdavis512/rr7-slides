import { type RouteConfigEntry, prefix } from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';
import { readdir } from 'fs/promises';

export interface SlideInfo {
    path: string;
    file: string;
    slideshowName: string;
}

export interface SlideshowInfo {
    name: string;
    slides: SlideInfo[];
    routes: RouteConfigEntry[];
}

export interface SlideshowData {
    slideshows: SlideshowInfo[];
    allRoutes: RouteConfigEntry[];
}

/**
 * Get all slideshows and their individual slides
 * @returns Promise resolving to structured slideshow data with routes
 */
export async function getAllSlideshowsAndSlides(): Promise<SlideshowData> {
    try {
        // Get all slide directories
        const slidesDir = await readdir('./app/routes/slides', { withFileTypes: true });
        const slideDirectories = slidesDir
            .filter((item) => item.isDirectory())
            .map((item) => item.name);

        const slideshows: SlideshowInfo[] = [];
        const allRoutes: RouteConfigEntry[] = [];

        // Process each slideshow directory
        for (const dirName of slideDirectories) {
            try {
                // Generate routes for this specific slideshow directory
                const rawRoutes = await flatRoutes({
                    rootDirectory: `./app/routes/slides/${dirName}`
                });

                console.log(
                    `Debug - routes for ${dirName}:`,
                    rawRoutes.map((r) => ({ path: r.path, file: r.file }))
                );

                // Sort routes by path
                const sortedRoutes = rawRoutes.sort((a, b) =>
                    (a.path || '').localeCompare(b.path || '')
                );

                // Add prefix for the slideshow name
                const prefixedRoutes = prefix(dirName, sortedRoutes);
                console.log(
                    `Debug - prefixed routes for ${dirName}:`,
                    prefixedRoutes.map((r) => ({ path: r.path, file: r.file }))
                );

                // Extract slide information
                const slides: SlideInfo[] = rawRoutes.map((route) => ({
                    path: route.path || '',
                    file: route.file,
                    slideshowName: dirName
                }));

                // Create slideshow info
                const slideshowInfo: SlideshowInfo = {
                    name: dirName,
                    slides,
                    routes: prefixedRoutes
                };

                slideshows.push(slideshowInfo);
                allRoutes.push(...prefixedRoutes);
            } catch (error) {
                console.error(`Error processing slideshow ${dirName}:`, error);
            }
        }

        return {
            slideshows,
            allRoutes
        };
    } catch (error) {
        console.error('Error getting slideshows and slides:', error);
        return {
            slideshows: [],
            allRoutes: []
        };
    }
}

/**
 * Get just the routes for use in route configuration
 * @returns Promise resolving to array of route configurations
 */
export async function getSlideshowRoutes(): Promise<RouteConfigEntry[]> {
    const data = await getAllSlideshowsAndSlides();
    return data.allRoutes;
}
