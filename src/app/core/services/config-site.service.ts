import { inject, Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ConfigSite } from '../models/config-site.model';

@Injectable({ providedIn: 'root' })
export class ConfigSiteService {
  private firestore = inject(Firestore);
  private ref = () => doc(this.firestore, 'config', 'site');

  get(): Observable<ConfigSite | undefined> {
    return docData(this.ref()) as Observable<ConfigSite | undefined>;
  }

  async salvar(config: Partial<ConfigSite>): Promise<void> {
    await setDoc(this.ref(), config, { merge: true });
  }
}
