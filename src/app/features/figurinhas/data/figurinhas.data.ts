import { GrupoFigurinhas } from '../models/figurinha.model';

function codigos(sigla: string, qtd: number): string[] {
  return Array.from({ length: qtd }, (_, i) => `${sigla}${i + 1}`);
}

export const GRUPOS_FIGURINHAS: GrupoFigurinhas[] = [
  {
    grupo: 'FWC',
    nome: 'FIFA World Cup History',
    times: [
      { sigla: 'FWC', pais: 'FIFA World Cup History', codigos: codigos('FWC', 19) },
    ],
  },
  {
    grupo: 'A',
    nome: 'Grupo A',
    times: [
      { sigla: 'MEX', pais: 'México', codigos: codigos('MEX', 20) },
      { sigla: 'RSA', pais: 'África do Sul', codigos: codigos('RSA', 20) },
      { sigla: 'KOR', pais: 'Coreia do Sul', codigos: codigos('KOR', 20) },
      { sigla: 'CZE', pais: 'Rep. Tcheca', codigos: codigos('CZE', 20) },
    ],
  },
  {
    grupo: 'B',
    nome: 'Grupo B',
    times: [
      { sigla: 'CAN', pais: 'Canadá', codigos: codigos('CAN', 20) },
      { sigla: 'BIH', pais: 'Bósnia', codigos: codigos('BIH', 20) },
      { sigla: 'QAT', pais: 'Catar', codigos: codigos('QAT', 20) },
      { sigla: 'SUI', pais: 'Suíça', codigos: codigos('SUI', 20) },
    ],
  },
  {
    grupo: 'C',
    nome: 'Grupo C',
    times: [
      { sigla: 'BRA', pais: 'Brasil', codigos: codigos('BRA', 20) },
      { sigla: 'MAR', pais: 'Marrocos', codigos: codigos('MAR', 20) },
      { sigla: 'HAI', pais: 'Haiti', codigos: codigos('HAI', 20) },
      { sigla: 'SCO', pais: 'Escócia', codigos: codigos('SCO', 20) },
    ],
  },
  {
    grupo: 'D',
    nome: 'Grupo D',
    times: [
      { sigla: 'USA', pais: 'Estados Unidos', codigos: codigos('USA', 20) },
      { sigla: 'PAR', pais: 'Paraguai', codigos: codigos('PAR', 20) },
      { sigla: 'AUS', pais: 'Austrália', codigos: codigos('AUS', 20) },
      { sigla: 'TUR', pais: 'Turquia', codigos: codigos('TUR', 20) },
    ],
  },
  {
    grupo: 'E',
    nome: 'Grupo E',
    times: [
      { sigla: 'GER', pais: 'Alemanha', codigos: codigos('GER', 20) },
      { sigla: 'CUW', pais: 'Curaçao', codigos: codigos('CUW', 20) },
      { sigla: 'CIV', pais: 'Costa do Marfim', codigos: codigos('CIV', 20) },
      { sigla: 'ECU', pais: 'Equador', codigos: codigos('ECU', 20) },
    ],
  },
  {
    grupo: 'F',
    nome: 'Grupo F',
    times: [
      { sigla: 'NED', pais: 'Holanda', codigos: codigos('NED', 20) },
      { sigla: 'JPN', pais: 'Japão', codigos: codigos('JPN', 20) },
      { sigla: 'SWE', pais: 'Suécia', codigos: codigos('SWE', 20) },
      { sigla: 'TUN', pais: 'Tunísia', codigos: codigos('TUN', 20) },
    ],
  },
  {
    grupo: 'G',
    nome: 'Grupo G',
    times: [
      { sigla: 'BEL', pais: 'Bélgica', codigos: codigos('BEL', 20) },
      { sigla: 'EGY', pais: 'Egito', codigos: codigos('EGY', 20) },
      { sigla: 'IRN', pais: 'Irã', codigos: codigos('IRN', 20) },
      { sigla: 'NZL', pais: 'Nova Zelândia', codigos: codigos('NZL', 20) },
    ],
  },
  {
    grupo: 'H',
    nome: 'Grupo H',
    times: [
      { sigla: 'ESP', pais: 'Espanha', codigos: codigos('ESP', 20) },
      { sigla: 'CPV', pais: 'Cabo Verde', codigos: codigos('CPV', 20) },
      { sigla: 'KSA', pais: 'Arábia Saudita', codigos: codigos('KSA', 20) },
      { sigla: 'URU', pais: 'Uruguai', codigos: codigos('URU', 20) },
    ],
  },
  {
    grupo: 'I',
    nome: 'Grupo I',
    times: [
      { sigla: 'FRA', pais: 'França', codigos: codigos('FRA', 20) },
      { sigla: 'SEN', pais: 'Senegal', codigos: codigos('SEN', 20) },
      { sigla: 'IRQ', pais: 'Iraque', codigos: codigos('IRQ', 20) },
      { sigla: 'NOR', pais: 'Noruega', codigos: codigos('NOR', 20) },
    ],
  },
  {
    grupo: 'J',
    nome: 'Grupo J',
    times: [
      { sigla: 'ARG', pais: 'Argentina', codigos: codigos('ARG', 20) },
      { sigla: 'ALG', pais: 'Argélia', codigos: codigos('ALG', 20) },
      { sigla: 'AUT', pais: 'Áustria', codigos: codigos('AUT', 20) },
      { sigla: 'JOR', pais: 'Jordânia', codigos: codigos('JOR', 20) },
    ],
  },
  {
    grupo: 'K',
    nome: 'Grupo K',
    times: [
      { sigla: 'POR', pais: 'Portugal', codigos: codigos('POR', 20) },
      { sigla: 'COD', pais: 'Congo', codigos: codigos('COD', 20) },
      { sigla: 'UZB', pais: 'Uzbequistão', codigos: codigos('UZB', 20) },
      { sigla: 'COL', pais: 'Colômbia', codigos: codigos('COL', 20) },
    ],
  },
  {
    grupo: 'L',
    nome: 'Grupo L',
    times: [
      { sigla: 'ENG', pais: 'Inglaterra', codigos: codigos('ENG', 20) },
      { sigla: 'CRO', pais: 'Croácia', codigos: codigos('CRO', 20) },
      { sigla: 'GHA', pais: 'Gana', codigos: codigos('GHA', 20) },
      { sigla: 'PAN', pais: 'Panamá', codigos: codigos('PAN', 20) },
    ],
  },
  {
    grupo: 'CC',
    nome: 'Coca-Cola',
    times: [
      { sigla: 'CC', pais: 'Coca-Cola', codigos: codigos('CC', 14) },
    ],
  },
];

export const TODOS_CODIGOS: string[] = GRUPOS_FIGURINHAS.flatMap(g =>
  g.times.flatMap(t => t.codigos),
);

export const TOTAL_FIGURINHAS = TODOS_CODIGOS.length;
