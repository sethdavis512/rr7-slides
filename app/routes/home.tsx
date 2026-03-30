import { Link } from 'react-router';
import type { Route } from './+types/home';

export function meta(_args: Route.MetaArgs) {
    return [
        { title: 'RR7 Slides - Theme Gallery' },
        {
            name: 'description',
            content:
                'A slideshow engine built with React Router 7. Pick a theme and present.'
        }
    ];
}

const themes = [
    {
        id: 'ink',
        name: 'Ink',
        description: 'Quiet luxury. Serif headlines, cool blue tones, refined restraint.',
        fonts: 'Instrument Serif + Outfit'
    },
    {
        id: 'warm',
        name: 'Warm',
        description:
            'Editorial and organic. Variable serif headlines, earthy terracotta tones.',
        fonts: 'Fraunces + DM Sans'
    },
    {
        id: 'sharp',
        name: 'Sharp',
        description:
            'Brutalist minimalism. Geometric sans, high contrast, bold red accent.',
        fonts: 'Space Grotesk'
    }
] as const;

export default function Home() {
    return (
        <div className="min-h-screen bg-surface text-ink">
            <div className="max-w-5xl mx-auto px-8 py-20">
                <header className="mb-20">
                    <h1 className="font-display text-[clamp(2.5rem,5vw+0.5rem,4.5rem)] text-ink leading-[0.95] mb-4">
                        RR7 Slides
                    </h1>
                    <p className="text-ink-secondary text-lg max-w-[45ch]">
                        A slideshow engine built with React Router 7. Same
                        slides, different themes. Pick one and present.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {themes.map((theme) => (
                        <Link
                            key={theme.id}
                            to={`/${theme.id}/slides/intro`}
                            prefetch="intent"
                            className="group block"
                        >
                            <div
                                data-theme={theme.id}
                                className="aspect-[16/10] bg-surface rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-rule group-hover:border-accent transition-colors"
                            >
                                <div className="text-center px-8">
                                    <p className="font-display text-[clamp(1.5rem,2vw,2.25rem)] text-ink leading-tight mb-2">
                                        Presentation Title
                                    </p>
                                    <p className="text-ink-tertiary text-xs">
                                        {theme.fonts}
                                    </p>
                                </div>
                            </div>
                            <h2 className="text-lg font-medium text-ink mb-1 group-hover:text-accent transition-colors">
                                {theme.name}
                            </h2>
                            <p className="text-sm text-ink-secondary leading-relaxed">
                                {theme.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
