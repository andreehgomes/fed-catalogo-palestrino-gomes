import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Post } from '../models/post.model';
import { Categoria } from '../models/categoria.model';

const BASE_URL = 'https://palestrinogomes.com.br';
const SITE_NAME = 'Palestrino Gomes';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private document = inject(DOCUMENT);

  setHome(): void {
    this.setBasic(
      `${SITE_NAME} — Análises, Táticas e História do Palmeiras`,
      'Análises táticas profundas, história e opiniões sobre o Palmeiras. Canal YouTube Palestrino Gomes.',
      BASE_URL,
    );
  }

  setClassificacao(): void {
    const ano = new Date().getFullYear();
    this.setBasic(
      `Classificação Campeonato Brasileiro ${ano} | ${SITE_NAME}`,
      `Tabela de classificação do Brasileirão Série A ${ano} atualizada. Veja a posição do Palmeiras e de todos os times.`,
      `${BASE_URL}/classificacao`,
    );
  }

  setCopa(): void {
    this.setBasic(
      `Copa do Mundo 2026 — Tabela, Grupos e Resultados | ${SITE_NAME}`,
      'Acompanhe a Copa do Mundo de 2026: classificação dos grupos, resultados de todos os jogos e o mata-mata. Dados atualizados.',
      `${BASE_URL}/copa-2026`,
    );
  }

  setCategoria(cat: Categoria): void {
    const url = `${BASE_URL}/${cat.slug}`;
    this.setBasic(`${cat.nome} | ${SITE_NAME}`, cat.descricao, url);
  }

  setArtigo(post: Post, categoriaSlug: string): void {
    const url = `${BASE_URL}/${categoriaSlug}/${post.slug}`;
    const titulo = post.metaTitle ?? post.titulo;
    const descricao = post.metaDescription ?? post.excerpt;

    this.title.setTitle(titulo);
    this.meta.updateTag({ name: 'description', content: descricao });
    this.meta.updateTag({ property: 'og:title', content: post.titulo });
    this.meta.updateTag({ property: 'og:description', content: post.excerpt });
    this.meta.updateTag({ property: 'og:image', content: post.coverUrl });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: titulo });
    this.meta.updateTag({ name: 'twitter:description', content: descricao });
    this.meta.updateTag({ name: 'twitter:image', content: post.coverUrl });
    this.setCanonical(url);
  }

  addArtigoJsonLd(post: Post, categoriaSlug: string, categoriaNome: string): void {
    const url = `${BASE_URL}/${categoriaSlug}/${post.slug}`;
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: post.titulo,
      description: post.excerpt,
      image: [post.coverUrl],
      datePublished: new Date(post.publicadoEm).toISOString(),
      dateModified: new Date(post.atualizadoEm).toISOString(),
      author: { '@type': 'Person', name: 'Palestrino Gomes' },
      publisher: { '@type': 'Organization', name: SITE_NAME },
      url,
    };

    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: categoriaNome,
          item: `${BASE_URL}/${categoriaSlug}`,
        },
        { '@type': 'ListItem', position: 3, name: post.titulo, item: url },
      ],
    };

    this.addJsonLdScript('article-ld', articleLd);
    this.addJsonLdScript('breadcrumb-ld', breadcrumbLd);
  }

  private setBasic(titulo: string, descricao: string, url: string): void {
    this.title.setTitle(titulo);
    this.meta.updateTag({ name: 'description', content: descricao });
    this.meta.updateTag({ property: 'og:title', content: titulo });
    this.meta.updateTag({ property: 'og:description', content: descricao });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private addJsonLdScript(id: string, data: object): void {
    this.document.getElementById(id)?.remove();
    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }
}
