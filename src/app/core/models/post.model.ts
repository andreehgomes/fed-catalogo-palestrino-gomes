export type PostStatus = 'rascunho' | 'publicado' | 'agendado';

export interface Post {
  id: string;
  slug: string;
  titulo: string;
  excerpt: string;
  corpo: string;
  categoriaId: string;
  categoriaSlug: string;
  tags: string[];
  destaque?: boolean;
  coverUrl: string;
  coverCaption?: string;
  coverCredit?: string;
  youtubeId?: string;
  afiliados: string[];
  status: PostStatus;
  publicadoEm: Date;
  atualizadoEm: Date;
  tempoDeLeituraMin: number;
  metaTitle?: string;
  metaDescription?: string;
}
