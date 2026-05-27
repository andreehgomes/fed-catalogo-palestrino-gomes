export type Pilar = 'analises' | 'taticas' | 'opiniao' | 'historia';

export interface Categoria {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  pilar: Pilar;
}
