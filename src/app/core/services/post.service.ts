import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  Timestamp,
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
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Post, PostStatus } from '../models/post.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date(v as string);
}

function normalizar(post: Post): Post {
  return {
    ...post,
    publicadoEm: toDate(post.publicadoEm),
    atualizadoEm: toDate(post.atualizadoEm),
  };
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private firestore = inject(Firestore);
  private col = () => collection(this.firestore, 'posts');

  getPublicados(limitN = 10): Observable<Post[]> {
    const q = query(
      this.col(),
      where('status', '==', 'publicado'),
      orderBy('publicadoEm', 'desc'),
      limit(limitN),
    );
    return (collectionData(q, { idField: 'id' }) as Observable<Post[]>).pipe(
      map(posts => posts.map(normalizar)),
    );
  }

  getPorCategoria(categoriaId: string, limitN = 12): Observable<Post[]> {
    const q = query(
      this.col(),
      where('status', '==', 'publicado'),
      where('categoriaId', '==', categoriaId),
      orderBy('publicadoEm', 'desc'),
      limit(limitN),
    );
    return (collectionData(q, { idField: 'id' }) as Observable<Post[]>).pipe(
      map(posts => posts.map(normalizar)),
    );
  }

  getBySlug(slug: string): Observable<Post | undefined> {
    const q = query(
      this.col(),
      where('slug', '==', slug),
      where('status', '==', 'publicado'),
      limit(1),
    );
    return (collectionData(q, { idField: 'id' }) as Observable<Post[]>).pipe(
      map(posts => posts.map(normalizar)[0]),
    );
  }

  getTodos(): Observable<Post[]> {
    const q = query(this.col(), orderBy('atualizadoEm', 'desc'));
    return (collectionData(q, { idField: 'id' }) as Observable<Post[]>).pipe(
      map(posts => posts.map(normalizar)),
    );
  }

  getById(id: string): Observable<Post | undefined> {
    return (docData(doc(this.firestore, 'posts', id), { idField: 'id' }) as Observable<Post | undefined>).pipe(
      map(post => post ? normalizar(post) : undefined),
    );
  }

  async salvar(post: Partial<Post> & { id?: string }): Promise<string> {
    const id = post.id ?? doc(this.col()).id;
    const ref = doc(this.firestore, 'posts', id);
    await setDoc(
      ref,
      { ...post, id, atualizadoEm: serverTimestamp() },
      { merge: true },
    );
    return id;
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'posts', id));
  }
}
