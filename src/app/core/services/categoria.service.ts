import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private firestore = inject(Firestore);
  private col = () => collection(this.firestore, 'categorias');

  getTodas(): Observable<Categoria[]> {
    const q = query(this.col(), orderBy('nome'));
    return collectionData(q, { idField: 'id' }) as Observable<Categoria[]>;
  }

  getBySlug(slug: string): Observable<Categoria | undefined> {
    const q = query(this.col(), where('slug', '==', slug), limit(1));
    return (collectionData(q, { idField: 'id' }) as Observable<Categoria[]>).pipe(
      map(cats => cats[0]),
    );
  }

  getById(id: string): Observable<Categoria | undefined> {
    return docData(doc(this.firestore, 'categorias', id), { idField: 'id' }) as Observable<
      Categoria | undefined
    >;
  }

  async salvar(cat: Partial<Categoria> & { id?: string }): Promise<void> {
    const id = cat.id ?? doc(this.col()).id;
    await setDoc(doc(this.firestore, 'categorias', id), { ...cat, id }, { merge: true });
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'categorias', id));
  }
}
