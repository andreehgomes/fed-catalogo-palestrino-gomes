import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { figurinhasAuthGuard } from './core/guards/figurinhas-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'busca',
    loadComponent: () => import('./features/busca/busca.component').then(m => m.BuscaComponent),
  },
  {
    path: 'sobre',
    loadComponent: () => import('./features/sobre/sobre.component').then(m => m.SobreComponent),
  },
  {
    path: 'contato',
    loadComponent: () =>
      import('./features/contato/contato.component').then(m => m.ContatoComponent),
  },
  {
    path: 'privacidade',
    loadComponent: () =>
      import('./features/privacidade/privacidade.component').then(m => m.PrivacidadeComponent),
  },
  {
    path: 'aviso-ia',
    loadComponent: () =>
      import('./features/aviso-ia/aviso-ia.component').then(m => m.AvisoIaComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'posts', pathMatch: 'full' },
      {
        path: 'posts',
        loadComponent: () =>
          import('./features/admin/posts/admin-posts.component').then(m => m.AdminPostsComponent),
      },
      {
        path: 'posts/novo',
        loadComponent: () =>
          import('./features/admin/editor/admin-editor.component').then(
            m => m.AdminEditorComponent,
          ),
      },
      {
        path: 'posts/:id/editar',
        loadComponent: () =>
          import('./features/admin/editor/admin-editor.component').then(
            m => m.AdminEditorComponent,
          ),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/categorias/admin-categorias.component').then(
            m => m.AdminCategoriasComponent,
          ),
      },
      {
        path: 'tags',
        loadComponent: () =>
          import('./features/admin/tags/admin-tags.component').then(m => m.AdminTagsComponent),
      },
      {
        path: 'afiliados',
        loadComponent: () =>
          import('./features/admin/afiliados/admin-afiliados.component').then(
            m => m.AdminAfiliadosComponent,
          ),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./features/admin/configuracoes/admin-configuracoes.component').then(
            m => m.AdminConfiguracoesComponent,
          ),
      },
    ],
  },
  {
    path: 'classificacao',
    loadComponent: () =>
      import('./features/classificacao/classificacao.component').then(
        m => m.ClassificacaoComponent,
      ),
  },
  {
    path: 'copa-2026',
    loadComponent: () =>
      import('./features/copa/copa.component').then(m => m.CopaComponent),
  },
  {
    path: 'figurinhas',
    canActivate: [figurinhasAuthGuard],
    loadComponent: () =>
      import('./features/figurinhas/figurinhas-layout/figurinhas-layout.component').then(
        m => m.FigurinhasLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'album', pathMatch: 'full' },
      {
        path: 'album',
        loadComponent: () =>
          import('./features/figurinhas/figurinhas-album/figurinhas-album.component').then(
            m => m.FigurinhasAlbumComponent,
          ),
      },
      {
        path: 'trocar',
        loadComponent: () =>
          import('./features/figurinhas/figurinhas-trocar/figurinhas-trocar.component').then(
            m => m.FigurinhasTrocarComponent,
          ),
      },
    ],
  },
  // Rotas de slug dinâmico — devem vir por último
  {
    path: ':categoria',
    loadComponent: () =>
      import('./features/categoria/categoria.component').then(m => m.CategoriaComponent),
  },
  {
    path: ':categoria/:slug',
    loadComponent: () =>
      import('./features/artigo/artigo.component').then(m => m.ArtigoComponent),
  },
];
