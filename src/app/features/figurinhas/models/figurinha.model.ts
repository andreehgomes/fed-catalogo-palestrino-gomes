export interface GrupoFigurinhas {
  grupo: string;
  nome: string;
  times: TimeFigurinhas[];
}

export interface TimeFigurinhas {
  sigla: string;
  pais: string;
  bandeira: string;
  codigos: string[];
}

export interface FigurinhasUsuario {
  uid: string;
  displayName: string;
  photoURL: string | null;
  email: string;
  whatsapp?: string;
  cidade?: string;
  aceitaTroca?: boolean;
  quantidade: Record<string, number>; // total de cópias por código (0 = não tem)
  tenho: string[];      // códigos com qty >= 1 (para stats e exibição)
  repetidas: string[];  // códigos com qty >= 2 (para queries array-contains no Firestore)
}
