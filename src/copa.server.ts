/**
 * Camada de dados da página da Copa do Mundo 2026.
 *
 * Fonte: TheSportsDB (https://www.thesportsdb.com) — API pública e gratuita,
 * atualizada pela própria plataforma (não estática). A chave padrão "123" é a
 * chave de testes pública; defina THESPORTSDB_API_KEY com uma chave de apoiador
 * ($9/mês) para habilitar placares ao vivo de 2 minutos.
 *
 * Endpoint usado (tier gratuito):
 *  - eventsround.php?id=4429&r={rodada}&s=2026 → jogos por rodada (inclui o grupo
 *    A–L e o placar). Usado para a fase de grupos e o mata-mata. NÃO é limitado a
 *    15 itens (ao contrário de eventsseason.php).
 */

const KEY = process.env['THESPORTSDB_API_KEY'] || '123';
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

const LIGA_COPA = '4429';
const TEMPORADA = '2026';

// Rodadas da fase de grupos (cada seleção joga 3 partidas).
const RODADAS_GRUPOS = ['1', '2', '3'];

// Códigos de rodada do mata-mata no TheSportsDB. A rotulação final é feita pela
// QUANTIDADE de jogos (16 = 16-avos, 8 = oitavas, ...), então a lista abaixo é
// apenas o conjunto de candidatos que o servidor sonda; códigos vazios são
// ignorados sem erro.
const RODADAS_MATA_MATA = ['140', '150', '160', '170', '180', '190', '200'];
const CODIGO_FINAL = '200';

// ----- Tipos do payload normalizado (consumido pelo Angular) -----

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

export interface CopaPayload {
  atualizadoEm: string;
  grupos: GrupoCopa[];
  rodadasGrupos: FaseCopa[];
  mataMata: FaseCopa[];
}

// ----- Acesso à API -----

interface RawEvent {
  idEvent: string;
  strTimestamp?: string | null;
  dateEvent?: string | null;
  strStatus?: string | null;
  intRound?: string | null;
  strGroup?: string | null;
  strHomeTeam?: string | null;
  strAwayTeam?: string | null;
  strHomeTeamBadge?: string | null;
  strAwayTeamBadge?: string | null;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  strVenue?: string | null;
  strVideo?: string | null;
}

async function buscarEventos(url: string): Promise<RawEvent[]> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const texto = await resp.text();
    if (!texto.trim()) return [];
    const data = JSON.parse(texto);
    const eventos = data?.events;
    return Array.isArray(eventos) ? eventos : [];
  } catch {
    return [];
  }
}

const STATUS_FINALIZADO = new Set(['FT', 'AET', 'AP', 'PEN', 'Match Finished']);

function parseScore(valor: string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

// O TheSportsDB envia o horário (strTimestamp) em UTC, porém sem o sufixo "Z".
// Sem o "Z", o JavaScript interpreta como horário local e a data sai errada.
// Esta função devolve um ISO em UTC explícito; o fuso de Brasília (-0300) é
// aplicado na exibição (DatePipe) no componente.
function paraIsoUtc(ev: RawEvent): string | null {
  const ts = ev.strTimestamp?.trim();
  if (ts) {
    const temFuso = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(ts);
    return temFuso ? ts : `${ts.replace(' ', 'T')}Z`;
  }
  if (ev.dateEvent?.trim()) return `${ev.dateEvent.trim()}T00:00:00Z`;
  return null;
}

// Nomes de seleções em português (TheSportsDB retorna em inglês). Nomes não
// mapeados são mantidos como vieram.
const SELECOES_PT: Record<string, string> = {
  Mexico: 'México',
  'South Africa': 'África do Sul',
  'South Korea': 'Coreia do Sul',
  'Czech Republic': 'República Tcheca',
  Canada: 'Canadá',
  'Bosnia-Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  USA: 'Estados Unidos',
  'United States': 'Estados Unidos',
  Paraguay: 'Paraguai',
  Brazil: 'Brasil',
  Morocco: 'Marrocos',
  Qatar: 'Catar',
  Switzerland: 'Suíça',
  Haiti: 'Haiti',
  Scotland: 'Escócia',
  Germany: 'Alemanha',
  Curaçao: 'Curaçao',
  Curacao: 'Curaçao',
  'Ivory Coast': 'Costa do Marfim',
  "Cote d'Ivoire": 'Costa do Marfim',
  Ecuador: 'Equador',
  Netherlands: 'Holanda',
  Japan: 'Japão',
  Australia: 'Austrália',
  Turkey: 'Turquia',
  Türkiye: 'Turquia',
  Belgium: 'Bélgica',
  Egypt: 'Egito',
  'Saudi Arabia': 'Arábia Saudita',
  Uruguay: 'Uruguai',
  Spain: 'Espanha',
  'Cape Verde': 'Cabo Verde',
  Sweden: 'Suécia',
  Tunisia: 'Tunísia',
  Iran: 'Irã',
  'New Zealand': 'Nova Zelândia',
  France: 'França',
  Senegal: 'Senegal',
  Iraq: 'Iraque',
  Norway: 'Noruega',
  Argentina: 'Argentina',
  Algeria: 'Argélia',
  Austria: 'Áustria',
  Jordan: 'Jordânia',
  Portugal: 'Portugal',
  'DR Congo': 'RD Congo',
  'DR Congo (Congo DR)': 'RD Congo',
  'Congo DR': 'RD Congo',
  Uzbekistan: 'Uzbequistão',
  Colombia: 'Colômbia',
  England: 'Inglaterra',
  Croatia: 'Croácia',
  Ghana: 'Gana',
  Panama: 'Panamá',
  Peru: 'Peru',
  Chile: 'Chile',
  Bolivia: 'Bolívia',
  Venezuela: 'Venezuela',
  Italy: 'Itália',
  Nigeria: 'Nigéria',
  Cameroon: 'Camarões',
  Wales: 'País de Gales',
  Denmark: 'Dinamarca',
  Poland: 'Polônia',
  Serbia: 'Sérvia',
  Greece: 'Grécia',
  Ukraine: 'Ucrânia',
  Romania: 'Romênia',
  Hungary: 'Hungria',
  Slovakia: 'Eslováquia',
  Slovenia: 'Eslovênia',
  'Costa Rica': 'Costa Rica',
  Honduras: 'Honduras',
  Jamaica: 'Jamaica',
  'New Caledonia': 'Nova Caledônia',
  Suriname: 'Suriname',
  'United Arab Emirates': 'Emirados Árabes Unidos',
  Oman: 'Omã',
  Mali: 'Mali',
  Gabon: 'Gabão',
  Nigéria: 'Nigéria',
};

function traduzirSelecao(nome: string | null | undefined): string {
  if (!nome) return 'A definir';
  return SELECOES_PT[nome] ?? nome;
}

function normalizarJogo(ev: RawEvent): JogoCopa {
  const placarCasa = parseScore(ev.intHomeScore);
  const placarFora = parseScore(ev.intAwayScore);
  const status = ev.strStatus ?? 'NS';
  const finalizado =
    STATUS_FINALIZADO.has(status) || (placarCasa !== null && placarFora !== null && status !== 'NS');
  return {
    id: ev.idEvent,
    data: paraIsoUtc(ev),
    status,
    finalizado,
    timeCasa: traduzirSelecao(ev.strHomeTeam),
    timeFora: traduzirSelecao(ev.strAwayTeam),
    escudoCasa: ev.strHomeTeamBadge || null,
    escudoFora: ev.strAwayTeamBadge || null,
    placarCasa,
    placarFora,
    local: ev.strVenue || null,
    grupo: ev.strGroup || null,
    video: ev.strVideo || null,
  };
}

function ordenarPorData(jogos: JogoCopa[]): JogoCopa[] {
  return [...jogos].sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''));
}

// ----- Fase de grupos: classificação calculada a partir dos resultados -----

function montarGrupos(jogosGrupos: JogoCopa[]): GrupoCopa[] {
  const porGrupo = new Map<string, JogoCopa[]>();
  for (const jogo of jogosGrupos) {
    if (!jogo.grupo) continue;
    const lista = porGrupo.get(jogo.grupo) ?? [];
    lista.push(jogo);
    porGrupo.set(jogo.grupo, lista);
  }

  const grupos: GrupoCopa[] = [];
  for (const [letra, jogos] of porGrupo) {
    const tabela = new Map<string, ClassificacaoTimeCopa>();

    const garantir = (nome: string, escudo: string | null): ClassificacaoTimeCopa => {
      let t = tabela.get(nome);
      if (!t) {
        t = {
          posicao: 0,
          nome,
          escudoUrl: escudo,
          pontos: 0,
          jogos: 0,
          vitorias: 0,
          empates: 0,
          derrotas: 0,
          golsPro: 0,
          golsContra: 0,
          saldoGols: 0,
        };
        tabela.set(nome, t);
      }
      if (!t.escudoUrl && escudo) t.escudoUrl = escudo;
      return t;
    };

    for (const jogo of jogos) {
      const casa = garantir(jogo.timeCasa, jogo.escudoCasa);
      const fora = garantir(jogo.timeFora, jogo.escudoFora);
      if (!jogo.finalizado || jogo.placarCasa === null || jogo.placarFora === null) continue;

      casa.jogos++;
      fora.jogos++;
      casa.golsPro += jogo.placarCasa;
      casa.golsContra += jogo.placarFora;
      fora.golsPro += jogo.placarFora;
      fora.golsContra += jogo.placarCasa;

      if (jogo.placarCasa > jogo.placarFora) {
        casa.pontos += 3;
        casa.vitorias++;
        fora.derrotas++;
      } else if (jogo.placarCasa < jogo.placarFora) {
        fora.pontos += 3;
        fora.vitorias++;
        casa.derrotas++;
      } else {
        casa.pontos++;
        fora.pontos++;
        casa.empates++;
        fora.empates++;
      }
    }

    const times = [...tabela.values()];
    for (const t of times) t.saldoGols = t.golsPro - t.golsContra;
    times.sort(
      (a, b) =>
        b.pontos - a.pontos ||
        b.saldoGols - a.saldoGols ||
        b.golsPro - a.golsPro ||
        a.nome.localeCompare(b.nome),
    );
    times.forEach((t, i) => (t.posicao = i + 1));

    grupos.push({ letra, nome: `Grupo ${letra}`, times });
  }

  grupos.sort((a, b) => a.letra.localeCompare(b.letra));
  return grupos;
}

function montarRodadasGrupos(eventosPorRodada: { rodada: string; jogos: JogoCopa[] }[]): FaseCopa[] {
  return eventosPorRodada
    .filter(r => r.jogos.length)
    .map(r => ({
      nome: `Fase de Grupos · ${r.rodada}ª Rodada`,
      ordem: Number(r.rodada),
      jogos: ordenarPorData(r.jogos),
    }));
}

// ----- Mata-mata: rótulo pela quantidade de jogos -----

function rotularMataMata(
  codigo: string,
  jogos: JogoCopa[],
): { nome: string; ordem: number } {
  const n = jogos.length;
  if (n >= 13) return { nome: '16-avos de final', ordem: 1 };
  if (n >= 7) return { nome: 'Oitavas de final', ordem: 2 };
  if (n >= 3) return { nome: 'Quartas de final', ordem: 3 };
  if (n === 2) return { nome: 'Semifinais', ordem: 4 };
  // 1 jogo: Final (código 200) x Disputa de 3º lugar.
  if (codigo === CODIGO_FINAL) return { nome: 'Final', ordem: 6 };
  return { nome: 'Disputa do 3º lugar', ordem: 5 };
}

// ----- Montagem do payload completo -----

export async function montarCopaPayload(): Promise<CopaPayload> {
  // Fase de grupos (rodadas 1–3).
  const rodadasGruposRaw = await Promise.all(
    RODADAS_GRUPOS.map(async r => ({
      rodada: r,
      jogos: (await buscarEventos(`${BASE}/eventsround.php?id=${LIGA_COPA}&r=${r}&s=${TEMPORADA}`)).map(
        normalizarJogo,
      ),
    })),
  );
  const jogosGrupos = rodadasGruposRaw.flatMap(r => r.jogos);
  const grupos = montarGrupos(jogosGrupos);
  const rodadasGrupos = montarRodadasGrupos(rodadasGruposRaw);

  // Mata-mata (sonda os códigos candidatos).
  const mataMataRaw = await Promise.all(
    RODADAS_MATA_MATA.map(async codigo => ({
      codigo,
      jogos: (await buscarEventos(`${BASE}/eventsround.php?id=${LIGA_COPA}&r=${codigo}&s=${TEMPORADA}`)).map(
        normalizarJogo,
      ),
    })),
  );
  const mataMata: FaseCopa[] = mataMataRaw
    .filter(r => r.jogos.length)
    .map(r => {
      const { nome, ordem } = rotularMataMata(r.codigo, r.jogos);
      return { nome, ordem, jogos: ordenarPorData(r.jogos) };
    })
    .sort((a, b) => a.ordem - b.ordem);

  return {
    atualizadoEm: new Date().toISOString(),
    grupos,
    rodadasGrupos,
    mataMata,
  };
}
