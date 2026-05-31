export interface ClassificacaoTime {
  posicao: number;
  nome: string;
  nomeAbreviado: string;
  escudoUrl: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
}

export interface ClassificacaoTabela {
  temporada: number;
  rodadaAtual: number;
  atualizadoEm: Date;
  times: ClassificacaoTime[];
}
