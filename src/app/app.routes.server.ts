import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Render on the server for every request so content edited in the admin
    // panel appears immediately, without a rebuild. (Prerendering would bake
    // content in at build time.)
    path: '**',
    renderMode: RenderMode.Server,
  },
];
