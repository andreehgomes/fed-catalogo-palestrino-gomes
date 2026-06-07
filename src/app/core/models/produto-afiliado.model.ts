export interface ProdutoAfiliado {
  id: string;
  titulo: string;
  imagemUrl: string;
  preco: number;
  linkAfiliado: string;
  disclosure: string;
  /** Quando true, o produto aparece na vitrine das páginas de figurinhas */
  exibirFigurinhas?: boolean;
}
