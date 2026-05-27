import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  query,
  orderBy,
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Tag } from '../models/tag.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  private firestore = inject(Firestore);
  private col = () => collection(this.firestore, 'tags');

  getTodas(): Observable<Tag[]> {
    const q = query(this.col(), orderBy('nome'));
    return collectionData(q, { idField: 'id' }) as Observable<Tag[]>;
  }

  async salvar(tag: Partial<Tag> & { id?: string }): Promise<string> {
    const id = tag.id ?? doc(this.col()).id;
    await setDoc(doc(this.firestore, 'tags', id), { ...tag, id }, { merge: true });
    return id;
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'tags', id));
  }
}
