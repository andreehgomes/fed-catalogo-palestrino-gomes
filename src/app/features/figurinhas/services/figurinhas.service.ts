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

  salvar(perfil: Omit<FigurinhasUsuario, never>): Observable<void> {
    const ref = doc(this.firestore, COLLECTION, perfil.uid);
    return from(
      setDoc(ref, { ...perfil, updatedAt: serverTimestamp() }, { merge: true }),
    );
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
  // Firestore array-contains-any suporta até 30 valores.
  buscarParceiros(meusFaltando: string[]): Observable<FigurinhasUsuario[]> {
    if (!meusFaltando.length) return of([]);
    const ref = collection(this.firestore, COLLECTION);
    const amostra = meusFaltando.slice(0, 30);
    const q = query(ref, where('repetidas', 'array-contains-any', amostra));
    return from(getDocsFromServer(q)).pipe(
      map(snap => snap.docs.map(d => d.data() as FigurinhasUsuario)),
    );
  }

  perfil(uid: string): Observable<FigurinhasUsuario | undefined> {
    const ref = doc(this.firestore, COLLECTION, uid);
    return docData(ref) as Observable<FigurinhasUsuario | undefined>;
  }
}
