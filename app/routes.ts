import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route(':themeId/slides/:slideId', 'routes/stage.tsx')
] satisfies RouteConfig;
