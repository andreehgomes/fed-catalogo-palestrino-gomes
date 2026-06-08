import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDocsFromServer,
  query,
  setDoc,
  serverTimestamp,
  where,
} from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FigurinhasUsuario } from '../models/figurinha.model';

const COLLECTION = 'figurinhas_usuarios';

@Injectable({ providedIn: 'root' })
export class FigurinhasService {
  private firestore = inject(Firestore);

  meuPerfil(uid: string): Observable<FigurinhasUsuario | undefined> {
    const ref = doc(this.firestore, COLLECTION, uid);
    return docData(ref) as Observable<FigurinhasUsuario | undefined>;
  }

  // setDoc SEM merge: o documento é sempre enviado completo. Com merge:true o
  // mapa `quantidade` sofria merge profundo e chaves removidas (figurinha
  // decrementada até zero) nunca eram apagadas no Firestore.
  salvar(perfil: Omit<FigurinhasUsuario, never>): Observable<void> {
    const ref = doc(this.firestore, COLLECTION, perfil.uid);
    return from(setDoc(ref, { ...perfil, updatedAt: serverTimestamp() }));
  }

  // getDocsFromServer garante dados sempre frescos: o cache local do Firestore
  // não reflete alterações de outros usuários (ex: "Aparecer nas trocas") até um reload.
  buscarPorRepetida(codigo: string): Observable<FigurinhasUsuario[]> {
    const ref = collection(this.firestore, COLLECTION);
    const q = query(ref, where('repetidas', 'array-contains', codigo));
    return from(getDocsFromServer(q)).pipe(
      map(snap => snap.docs.map(d => d.data() as FigurinhasUsuario)),
    );
  }

  // Busca usuários que têm como repetida alguma figurinha que eu preciso.
  // Traz todos com aceitaTroca=true e cruza no cliente — o array-contains-any
  // do Firestore é limitado a 30 valores e deixava parceiros de fora quando
  // o usuário tinha muitas figurinhas faltando.
  buscarParceiros(meusFaltando: string[]): Observable<FigurinhasUsuario[]> {
    if (!meusFaltando.length) return of([]);
    const ref = collection(this.firestore, COLLECTION);
    const q = query(ref, where('aceitaTroca', '==', true));
    const faltando = new Set(meusFaltando);
    return from(getDocsFromServer(q)).pipe(
      map(snap =>
        snap.docs
          .map(d => d.data() as FigurinhasUsuario)
          .filter(u => (u.repetidas ?? []).some(c => faltando.has(c))),
      ),
    );
  }

  perfil(uid: string): Observable<FigurinhasUsuario | undefined> {
    const ref = doc(this.firestore, COLLECTION, uid);
    return docData(ref) as Observable<FigurinhasUsuario | undefined>;
  }
}
