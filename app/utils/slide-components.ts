// Static slide component imports - leverages React Router 7's automatic code splitting
// These imports are resolved at build time, not runtime

import Intro from '../routes/slides/01-intro.mdx';
import Alfa from '../routes/slides/02-alfa.mdx';
import Beta from '../routes/slides/03-beta.mdx';
import Charlie from '../routes/slides/04-charlie.mdx';
import Delta from '../routes/slides/05-delta.mdx';
import End from '../routes/slides/06-end.mdx';

// Static component mapping - no dynamic imports needed
export const SLIDE_COMPONENTS: Record<string, React.ComponentType> = {
    intro: Intro,
    alfa: Alfa,
    beta: Beta,
    charlie: Charlie,
    delta: Delta,
    end: End
} as const;

// Get slide component by ID
export function getSlideComponent(slideId: string): React.ComponentType | null {
    return SLIDE_COMPONENTS[slideId] || null;
}
