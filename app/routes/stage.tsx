import { Link, useNavigate } from 'react-router';
import { useEffect, Suspense, useState } from 'react';
import { getSlideNavigation, slideExists, getFirstSlideId, getAllSlideIds } from '../utils/slides.server';
import { getSlideComponent } from '../utils/slide-discovery';
import type { Route } from './+types/stage';

// Server-side loader - all slide resolution happens on the server
export async function loader({ params }: Route.LoaderArgs) {
    const slideId = params.slideId || await getFirstSlideId();

    // Server-side slide validation and navigation data
    if (!(await slideExists(slideId))) {
        // Redirect to first slide if invalid
        const firstSlideId = await getFirstSlideId();
        throw new Response('', {
            status: 302,
            headers: {
                Location: `/slides/${firstSlideId}`
            }
        });
    }

    // Get all navigation data on the server
    const navigation = await getSlideNavigation(slideId);
    const allSlideIds = await getAllSlideIds();
    
    return {
        ...navigation,
        allSlideIds
    };
}

// Slide component wrapper with error boundary
function SlideComponentWrapper({ slideId }: { slideId: string }) {
    const [SlideComponent, setSlideComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadSlide() {
            try {
                const component = await getSlideComponent(slideId);
                if (isMounted) {
                    if (component) {
                        setSlideComponent(() => component);
                        setError(null);
                    } else {
                        setError('Slide not found');
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load slide');
                }
            }
        }

        loadSlide();

        return () => {
            isMounted = false;
        };
    }, [slideId]);

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-2xl mb-4">Error Loading Slide</h1>
                    <p className="text-gray-300">{error}</p>
                </div>
            </div>
        );
    }

    if (!SlideComponent) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading slide...</p>
                </div>
            </div>
        );
    }

    return <SlideComponent />;
}

export default function StageRoute({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { slideId, currentIndex, totalSlides, nextSlide, prevSlide, title, allSlideIds } = loaderData;

    // Minimal client-side keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' && prevSlide) {
                navigate(`/slides/${prevSlide}`);
            } else if (event.key === 'ArrowRight' && nextSlide) {
                navigate(`/slides/${nextSlide}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, nextSlide, prevSlide]);

    return (
        <div className="w-screen h-screen relative bg-gray-900 text-white overflow-hidden">
            {/* Slide title for SEO and accessibility */}
            <title>{`${title} - React Router 7 Slides`}</title>
            
            <div className="px-32 py-16 pb-32 xl:px-24 md:px-16 h-full flex items-center justify-center">
                <div className="max-w-4xl w-full">
                    {/* Dynamically loaded slide component with Suspense */}
                    <Suspense 
                        fallback={
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-300">Loading slide...</p>
                                </div>
                            </div>
                        }
                    >
                        <SlideComponentWrapper slideId={slideId} />
                    </Suspense>
                </div>
            </div>

            {/* Navigation buttons with Link for prefetching */}
            {prevSlide && (
                <Link
                    to={`/slides/${prevSlide}`}
                    className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white p-4 rounded-full transition-all border border-gray-600 hover:border-gray-400 shadow-lg"
                    aria-label="Previous slide"
                    prefetch="intent"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </Link>
            )}

            {nextSlide && (
                <Link
                    to={`/slides/${nextSlide}`}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white p-4 rounded-full transition-all border border-gray-600 hover:border-gray-400 shadow-lg"
                    aria-label="Next slide"
                    prefetch="intent"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </Link>
            )}

            {/* Slide indicator with Link prefetching */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-2">
                    {allSlideIds.map((targetSlideId, slideIndex) => {
                        const isActive = slideIndex === currentIndex;
                        
                        return (
                            <Link
                                key={slideIndex}
                                to={`/slides/${targetSlideId}`}
                                className={`w-3 h-3 rounded-full transition-all cursor-pointer hover:scale-110 ${
                                    isActive
                                        ? 'bg-white opacity-100'
                                        : 'bg-white opacity-25 hover:opacity-50'
                                }`}
                                aria-label={`Go to slide ${slideIndex + 1}`}
                                prefetch="intent"
                            />
                        );
                    })}
                </div>
            </div>

            {/* Slide counter */}
            <div className="absolute top-8 right-8 text-sm opacity-70">
                {currentIndex + 1} / {totalSlides}
            </div>
        </div>
    );
}