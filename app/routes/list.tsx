import { Link, useRouteLoaderData } from 'react-router';

import type { SlideshowData, SlideshowInfo } from '../utils/common';

export default function SlidesListRoute() {
    const rootData = useRouteLoaderData<{ appConfig: SlideshowData }>(
        'root'
    );

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-2xl font-bold">Slides</h1>
            <ul>
                {rootData?.appConfig?.slideshows.map(
                    (slideshow: SlideshowInfo) => (
                        <li key={slideshow.name}>
                            <Link to={`/slides/${slideshow.name}`}>{slideshow.name}</Link>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}
