import { useNavigate } from 'react-router';
import { useEffect, useState, Suspense } from 'react';
import {
    getSlides,
    importSlide,
    getNextSlideId,
    getPreviousSlideId,
    type SlideMetadata
} from '../utils/slide-discovery';
import type { Route } from './+types/stage';

// Loader function to fetch data following React Router 7 conventions
export async function loader({ params }: Route.LoaderArgs) {
    const { slideId = '' } = params;

    try {
        // Load all slides
        const slides = await getSlides();

        // Find current slide index
        const currentSlideIndex = slides.findIndex((s) => s.id === slideId);

        // If slideId doesn't exist, redirect to first slide
        if (currentSlideIndex === -1 && slides.length > 0) {
            throw new Response('', {
                status: 302,
                headers: {
                    Location: `/slides/${slides[0].id}`
                }
            });
        }

        return {
            slides,
            currentSlideIndex: Math.max(0, currentSlideIndex),
            slideId
        };
    } catch (error) {
        // If slide not found, get all slides and redirect to first
        const slides = await getSlides();
        if (slides.length > 0) {
            throw new Response('', {
                status: 302,
                headers: {
                    Location: `/slides/${slides[0].id}`
                }
            });
        }
        throw error;
    }
}

export default function StageRoute({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { slides, currentSlideIndex, slideId } = loaderData;
    const [SlideComponent, setSlideComponent] =
        useState<React.ComponentType | null>(null);
    const [loading, setLoading] = useState(true);

    // Load the slide component when slideId changes
    useEffect(() => {
        if (!slideId) {
            setLoading(false);
            return;
        }

        const loadSlideComponent = async () => {
            setLoading(true);
            try {
                const component = await importSlide(slideId);
                setSlideComponent(() => component);
                setLoading(false);
            } catch {
                setSlideComponent(null);
                setLoading(false);
            }
        };

        loadSlideComponent();
    }, [slideId]);

    const goToNextSlide = async () => {
        const nextSlideId = await getNextSlideId(slideId);
        if (nextSlideId) navigate(`/slides/${nextSlideId}`);
    };

    const goToPrevSlide = async () => {
        const prevSlideId = await getPreviousSlideId(slideId);
        if (prevSlideId) navigate(`/slides/${prevSlideId}`);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                goToPrevSlide();
            } else if (event.key === 'ArrowRight') {
                goToNextSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slideId]);

    if (loading || !SlideComponent) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    {loading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    ) : null}
                    <h1 className="text-2xl">
                        {loading ? 'Loading slide...' : 'Slide not found'}
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen relative bg-gray-900 text-white overflow-hidden">
            <div className="px-32 py-16 pb-32 xl:px-24 md:px-16 h-full flex items-center justify-center">
                <div className="max-w-4xl w-full">
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        }
                    >
                        <SlideComponent />
                    </Suspense>
                </div>
            </div>

            {/* Navigation buttons */}
            <button
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0 || loading}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-full transition-all border border-gray-600 hover:border-gray-400 shadow-lg"
                aria-label="Previous slide"
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
            </button>

            <button
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1 || loading}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-full transition-all border border-gray-600 hover:border-gray-400 shadow-lg"
                aria-label="Next slide"
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
            </button>

            {/* Slide indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-2">
                    {slides.map((slide, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(`/slides/${slide.id}`)}
                            className={`w-3 h-3 rounded-full transition-all cursor-pointer hover:scale-110 ${
                                index === currentSlideIndex
                                    ? 'bg-white opacity-100'
                                    : 'bg-white opacity-25 hover:opacity-50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Slide counter */}
            <div className="absolute top-8 right-8 text-sm opacity-70">
                {currentSlideIndex + 1} / {slides.length}
            </div>
        </div>
    );
}
