import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const CACHE_COLLECTION = 'cache';
const CACHE_DOC = 'classificacao_bsa';

function ensureAdminApp() {
  if (!getApps().length) {
    initializeApp();
  }
}

export interface CacheEntry {
  payload: unknown;
  savedAt: number;
}

export async function readClassificacaoCache(): Promise<CacheEntry | null> {
  try {
    ensureAdminApp();
    const snapshot = await getFirestore().collection(CACHE_COLLECTION).doc(CACHE_DOC).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data()!;
    return { payload: data['payload'], savedAt: data['savedAt'] as number };
  } catch {
    return null;
  }
}

export async function saveClassificacaoCache(payload: unknown): Promise<void> {
  try {
    ensureAdminApp();
    await getFirestore()
      .collection(CACHE_COLLECTION)
      .doc(CACHE_DOC)
      .set({ payload, savedAt: Date.now() });
  } catch {
    // Silent fail — cache write must not block the response
  }
}
