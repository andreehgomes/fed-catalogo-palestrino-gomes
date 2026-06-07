import { RenderMode, ServerRoute } from '@angular/ssr';

// Rotas estáticas: Prerender em produção (com credenciais Firebase preenchidas).
// Em dev / CI sem credenciais: manter Server para não falhar o build.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'sobre', renderMode: RenderMode.Server },
  { path: 'contato', renderMode: RenderMode.Server },
  { path: 'privacidade', renderMode: RenderMode.Server },
  { path: 'aviso-ia', renderMode: RenderMode.Server },
  { path: 'busca', renderMode: RenderMode.Server },
  { path: 'classificacao', renderMode: RenderMode.Server },
  { path: 'admin/login', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: 'figurinhas/**', renderMode: RenderMode.Client },
  { path: ':categoria', renderMode: RenderMode.Server },
  { path: ':categoria/:slug', renderMode: RenderMode.Server },
];
