import { Link } from 'react-router';
import type { Route } from './+types/home';

export function meta(_args: Route.MetaArgs) {
    return [
        { title: 'RR7 Slides' },
        {
            name: 'description',
            content: 'A presentation built with React Router 7'
        }
    ];
}

export default function Home() {
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center max-w-2xl px-8">
                <h1 className="text-5xl font-bold mb-6 text-white">
                    Welcome to RR7 Slides!
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    This is your presentation workspace.
                    <br />
                    Click below to begin your slides.
                </p>
                <Link
                    to="/slides/intro"
                    prefetch="intent"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 text-lg shadow-lg hover:shadow-xl hover:scale-105"
                >
                    Go to First Slide
                </Link>
            </div>
        </div>
    );
}
