export interface JogoCopa {
  id: string;
  data: string | null;
  status: string;
  finalizado: boolean;
  timeCasa: string;
  timeFora: string;
  escudoCasa: string | null;
  escudoFora: string | null;
  placarCasa: number | null;
  placarFora: number | null;
  local: string | null;
  grupo: string | null;
  video: string | null;
}

export interface ClassificacaoTimeCopa {
  posicao: number;
  nome: string;
  escudoUrl: string | null;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
}

export interface GrupoCopa {
  letra: string;
  nome: string;
  times: ClassificacaoTimeCopa[];
}

export interface FaseCopa {
  nome: string;
  ordem: number;
  jogos: JogoCopa[];
}

export interface CopaData {
  atualizadoEm: string;
  grupos: GrupoCopa[];
  rodadasGrupos: FaseCopa[];
  mataMata: FaseCopa[];
}
