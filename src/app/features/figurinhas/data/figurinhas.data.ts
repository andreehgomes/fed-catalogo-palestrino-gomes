import { GrupoFigurinhas } from '../models/figurinha.model';

function codigos(sigla: string, qtd: number): string[] {
  return Array.from({ length: qtd }, (_, i) => `${sigla}${i + 1}`);
}

export const GRUPOS_FIGURINHAS: GrupoFigurinhas[] = [
  {
    grupo: 'FWC',
    nome: 'FIFA World Cup History',
    times: [
      { sigla: 'FWC', pais: 'FIFA World Cup History', bandeira: '🏆', codigos: codigos('FWC', 19) },
    ],
  },
  {
    grupo: 'A',
    nome: 'Grupo A',
    times: [
      { sigla: 'MEX', pais: 'México', bandeira: '🇲🇽', codigos: codigos('MEX', 20) },
      { sigla: 'RSA', pais: 'África do Sul', bandeira: '🇿🇦', codigos: codigos('RSA', 20) },
      { sigla: 'KOR', pais: 'Coreia do Sul', bandeira: '🇰🇷', codigos: codigos('KOR', 20) },
      { sigla: 'CZE', pais: 'Rep. Tcheca', bandeira: '🇨🇿', codigos: codigos('CZE', 20) },
    ],
  },
  {
    grupo: 'B',
    nome: 'Grupo B',
    times: [
      { sigla: 'CAN', pais: 'Canadá', bandeira: '🇨🇦', codigos: codigos('CAN', 20) },
      { sigla: 'BIH', pais: 'Bósnia', bandeira: '🇧🇦', codigos: codigos('BIH', 20) },
      { sigla: 'QAT', pais: 'Catar', bandeira: '🇶🇦', codigos: codigos('QAT', 20) },
      { sigla: 'SUI', pais: 'Suíça', bandeira: '🇨🇭', codigos: codigos('SUI', 20) },
    ],
  },
  {
    grupo: 'C',
    nome: 'Grupo C',
    times: [
      { sigla: 'BRA', pais: 'Brasil', bandeira: '🇧🇷', codigos: codigos('BRA', 20) },
      { sigla: 'MAR', pais: 'Marrocos', bandeira: '🇲🇦', codigos: codigos('MAR', 20) },
      { sigla: 'HAI', pais: 'Haiti', bandeira: '🇭🇹', codigos: codigos('HAI', 20) },
      { sigla: 'SCO', pais: 'Escócia', bandeira: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', codigos: codigos('SCO', 20) },
    ],
  },
  {
    grupo: 'D',
    nome: 'Grupo D',
    times: [
      { sigla: 'USA', pais: 'Estados Unidos', bandeira: '🇺🇸', codigos: codigos('USA', 20) },
      { sigla: 'PAR', pais: 'Paraguai', bandeira: '🇵🇾', codigos: codigos('PAR', 20) },
      { sigla: 'AUS', pais: 'Austrália', bandeira: '🇦🇺', codigos: codigos('AUS', 20) },
      { sigla: 'TUR', pais: 'Turquia', bandeira: '🇹🇷', codigos: codigos('TUR', 20) },
    ],
  },
  {
    grupo: 'E',
    nome: 'Grupo E',
    times: [
      { sigla: 'GER', pais: 'Alemanha', bandeira: '🇩🇪', codigos: codigos('GER', 20) },
      { sigla: 'CUW', pais: 'Curaçao', bandeira: '🇨🇼', codigos: codigos('CUW', 20) },
      { sigla: 'CIV', pais: 'Costa do Marfim', bandeira: '🇨🇮', codigos: codigos('CIV', 20) },
      { sigla: 'ECU', pais: 'Equador', bandeira: '🇪🇨', codigos: codigos('ECU', 20) },
    ],
  },
  {
    grupo: 'F',
    nome: 'Grupo F',
    times: [
      { sigla: 'NED', pais: 'Holanda', bandeira: '🇳🇱', codigos: codigos('NED', 20) },
      { sigla: 'JPN', pais: 'Japão', bandeira: '🇯🇵', codigos: codigos('JPN', 20) },
      { sigla: 'SWE', pais: 'Suécia', bandeira: '🇸🇪', codigos: codigos('SWE', 20) },
      { sigla: 'TUN', pais: 'Tunísia', bandeira: '🇹🇳', codigos: codigos('TUN', 20) },
    ],
  },
  {
    grupo: 'G',
    nome: 'Grupo G',
    times: [
      { sigla: 'BEL', pais: 'Bélgica', bandeira: '🇧🇪', codigos: codigos('BEL', 20) },
      { sigla: 'EGY', pais: 'Egito', bandeira: '🇪🇬', codigos: codigos('EGY', 20) },
      { sigla: 'IRN', pais: 'Irã', bandeira: '🇮🇷', codigos: codigos('IRN', 20) },
      { sigla: 'NZL', pais: 'Nova Zelândia', bandeira: '🇳🇿', codigos: codigos('NZL', 20) },
    ],
  },
  {
    grupo: 'H',
    nome: 'Grupo H',
    times: [
      { sigla: 'ESP', pais: 'Espanha', bandeira: '🇪🇸', codigos: codigos('ESP', 20) },
      { sigla: 'CPV', pais: 'Cabo Verde', bandeira: '🇨🇻', codigos: codigos('CPV', 20) },
      { sigla: 'KSA', pais: 'Arábia Saudita', bandeira: '🇸🇦', codigos: codigos('KSA', 20) },
      { sigla: 'URU', pais: 'Uruguai', bandeira: '🇺🇾', codigos: codigos('URU', 20) },
    ],
  },
  {
    grupo: 'I',
    nome: 'Grupo I',
    times: [
      { sigla: 'FRA', pais: 'França', bandeira: '🇫🇷', codigos: codigos('FRA', 20) },
      { sigla: 'SEN', pais: 'Senegal', bandeira: '🇸🇳', codigos: codigos('SEN', 20) },
      { sigla: 'IRQ', pais: 'Iraque', bandeira: '🇮🇶', codigos: codigos('IRQ', 20) },
      { sigla: 'NOR', pais: 'Noruega', bandeira: '🇳🇴', codigos: codigos('NOR', 20) },
    ],
  },
  {
    grupo: 'J',
    nome: 'Grupo J',
    times: [
      { sigla: 'ARG', pais: 'Argentina', bandeira: '🇦🇷', codigos: codigos('ARG', 20) },
      { sigla: 'ALG', pais: 'Argélia', bandeira: '🇩🇿', codigos: codigos('ALG', 20) },
      { sigla: 'AUT', pais: 'Áustria', bandeira: '🇦🇹', codigos: codigos('AUT', 20) },
      { sigla: 'JOR', pais: 'Jordânia', bandeira: '🇯🇴', codigos: codigos('JOR', 20) },
    ],
  },
  {
    grupo: 'K',
    nome: 'Grupo K',
    times: [
      { sigla: 'POR', pais: 'Portugal', bandeira: '🇵🇹', codigos: codigos('POR', 20) },
      { sigla: 'COD', pais: 'Congo', bandeira: '🇨🇩', codigos: codigos('COD', 20) },
      { sigla: 'UZB', pais: 'Uzbequistão', bandeira: '🇺🇿', codigos: codigos('UZB', 20) },
      { sigla: 'COL', pais: 'Colômbia', bandeira: '🇨🇴', codigos: codigos('COL', 20) },
    ],
  },
  {
    grupo: 'L',
    nome: 'Grupo L',
    times: [
      { sigla: 'ENG', pais: 'Inglaterra', bandeira: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', codigos: codigos('ENG', 20) },
      { sigla: 'CRO', pais: 'Croácia', bandeira: '🇭🇷', codigos: codigos('CRO', 20) },
      { sigla: 'GHA', pais: 'Gana', bandeira: '🇬🇭', codigos: codigos('GHA', 20) },
      { sigla: 'PAN', pais: 'Panamá', bandeira: '🇵🇦', codigos: codigos('PAN', 20) },
    ],
  },
  {
    grupo: 'CC',
    nome: 'Coca-Cola',
    times: [
      { sigla: 'CC', pais: 'Coca-Cola', bandeira: '🚩', codigos: codigos('CC', 14) },
    ],
  },
];

export const TODOS_CODIGOS: string[] = GRUPOS_FIGURINHAS.flatMap(g =>
  g.times.flatMap(t => t.codigos),
);

export const TOTAL_FIGURINHAS = TODOS_CODIGOS.length;
