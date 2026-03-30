import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import {
    getSlideNavigation,
    slideExists,
    getFirstSlideId,
    getAllSlideIds
} from '../utils/slides.server';
import { getSlideComponent } from '../utils/slide-discovery';
import type { Route } from './+types/stage';

const VALID_THEMES = ['ink', 'warm', 'sharp'] as const;
type ThemeId = (typeof VALID_THEMES)[number];

function isValidTheme(id: string): id is ThemeId {
    return VALID_THEMES.includes(id as ThemeId);
}

// Server-side loader - all slide resolution happens on the server
export async function loader({ params }: Route.LoaderArgs) {
    const themeId = isValidTheme(params.themeId)
        ? params.themeId
        : 'ink';
    const slideId = params.slideId || (await getFirstSlideId());

    if (!isValidTheme(params.themeId)) {
        throw new Response('', {
            status: 302,
            headers: { Location: `/ink/slides/${slideId}` }
        });
    }

    if (!(await slideExists(slideId))) {
        const firstSlideId = await getFirstSlideId();
        throw new Response('', {
            status: 302,
            headers: { Location: `/${themeId}/slides/${firstSlideId}` }
        });
    }

    const navigation = await getSlideNavigation(slideId);
    const allSlideIds = await getAllSlideIds();

    return {
        ...navigation,
        allSlideIds,
        themeId
    };
}

function SlideComponentWrapper({ slideId }: { slideId: string }) {
    const [SlideComponent, setSlideComponent] =
        useState<React.ComponentType | null>(null);
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
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to load slide'
                    );
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
                <div className="text-center">
                    <h1 className="text-2xl font-display text-ink mb-4">
                        Error Loading Slide
                    </h1>
                    <p className="text-ink-secondary">{error}</p>
                </div>
            </div>
        );
    }

    if (!SlideComponent) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-ink-tertiary animate-pulse">Loading...</p>
            </div>
        );
    }

    return <SlideComponent />;
}

export default function StageRoute({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const {
        slideId,
        currentIndex,
        totalSlides,
        nextSlide,
        prevSlide,
        title,
        allSlideIds,
        transitionMap,
        themeId
    } = loaderData;

    const base = `/${themeId}/slides`;

    function setNavAttrs(
        targetSlideId: string,
        direction: 'forward' | 'back'
    ) {
        const el = document.documentElement;
        el.dataset.nav = direction;
        el.dataset.transition = transitionMap[targetSlideId] ?? 'depth';
    }

    function navigateSlide(to: string, direction: 'forward' | 'back') {
        setNavAttrs(to, direction);
        navigate(`${base}/${to}`, { viewTransition: true });
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' && prevSlide) {
                navigateSlide(prevSlide, 'back');
            } else if (event.key === 'ArrowRight' && nextSlide) {
                navigateSlide(nextSlide, 'forward');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, nextSlide, prevSlide, base]);

    return (
        <div
            data-theme={themeId}
            className="w-screen h-screen relative bg-surface text-ink overflow-hidden"
        >
            <title>{`${title} - React Router 7 Slides`}</title>

            <div className="slide-container px-24 py-16 pb-28 h-full flex items-center justify-center">
                <div className="max-w-5xl w-full">
                    <SlideComponentWrapper slideId={slideId} />
                </div>
            </div>

            {/* Navigation arrows */}
            {prevSlide && (
                <Link
                    to={`${base}/${prevSlide}`}
                    className="absolute left-8 top-1/2 -translate-y-1/2 p-3 text-ink-tertiary hover:text-ink transition-colors"
                    aria-label="Previous slide"
                    prefetch="intent"
                    viewTransition
                    onClick={() => setNavAttrs(prevSlide, 'back')}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
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
                    to={`${base}/${nextSlide}`}
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-3 text-ink-tertiary hover:text-ink transition-colors"
                    aria-label="Next slide"
                    prefetch="intent"
                    viewTransition
                    onClick={() => setNavAttrs(nextSlide, 'forward')}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </Link>
            )}

            {/* Slide indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="flex gap-2">
                    {allSlideIds.map((targetSlideId, slideIndex) => (
                        <Link
                            key={targetSlideId}
                            to={`${base}/${targetSlideId}`}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                slideIndex === currentIndex
                                    ? 'bg-ink'
                                    : 'bg-ink-tertiary hover:bg-ink-secondary'
                            }`}
                            aria-label={`Go to slide ${slideIndex + 1}`}
                            prefetch="intent"
                            viewTransition
                            onClick={() =>
                                setNavAttrs(
                                    targetSlideId,
                                    slideIndex > currentIndex
                                        ? 'forward'
                                        : 'back'
                                )
                            }
                        />
                    ))}
                </div>
            </div>

            {/* Slide counter + home link */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between text-sm text-ink-tertiary">
                <Link
                    to="/"
                    className="flex items-center gap-2 hover:text-ink transition-colors"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                        />
                    </svg>
                    <span>Themes</span>
                </Link>
                <span className="tabular-nums">
                    {currentIndex + 1} / {totalSlides}
                </span>
            </div>
        </div>
    );
}
