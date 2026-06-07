import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  orderBy,
  setDoc,
  deleteDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ProdutoAfiliado } from '../models/produto-afiliado.model';

@Injectable({ providedIn: 'root' })
export class ProdutoAfiliadoService {
  private firestore = inject(Firestore);
  private col = () => collection(this.firestore, 'produtos_afiliado');

  getTodos(): Observable<ProdutoAfiliado[]> {
    const q = query(this.col(), orderBy('titulo'));
    return collectionData(q, { idField: 'id' }) as Observable<ProdutoAfiliado[]>;
  }

  /** Produtos marcados no admin para aparecer nas páginas de figurinhas */
  getExibidosNasFigurinhas(): Observable<ProdutoAfiliado[]> {
    const q = query(this.col(), where('exibirFigurinhas', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<ProdutoAfiliado[]>;
  }

  getById(id: string): Observable<ProdutoAfiliado | undefined> {
    return docData(doc(this.firestore, 'produtos_afiliado', id), {
      idField: 'id',
    }) as Observable<ProdutoAfiliado | undefined>;
  }

  async salvar(produto: Partial<ProdutoAfiliado> & { id?: string }): Promise<void> {
    const id = produto.id ?? doc(this.col()).id;
    await setDoc(
      doc(this.firestore, 'produtos_afiliado', id),
      { ...produto, id },
      { merge: true },
    );
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'produtos_afiliado', id));
  }
}
