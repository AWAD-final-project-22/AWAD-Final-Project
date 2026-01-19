import { openDB } from 'idb';

const DB_NAME = 'awad_offline_cache';
const DB_VERSION = 1;

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const EMAIL_LIST_LIMIT = 200;

export const STORES = {
  mailboxes: 'mailboxes',
  emailLists: 'emailLists',
  emailDetails: 'emailDetails',
  kanbanColumns: 'kanbanColumns',
  workflows: 'workflows',
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

export interface CacheRecord<T> {
  key: string;
  data: T;
  updatedAt: number;
}

const getDb = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      Object.values(STORES).forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'key' });
        }
      });
    },
  });

const shouldDebug = () =>
  typeof window !== 'undefined' &&
  window.localStorage?.getItem('offline-cache-debug') === '1';

export const logOfflineCache = (
  message: string,
  meta?: Record<string, unknown>,
) => {
  if (!shouldDebug()) return;
  if (meta) {
    console.info('[offline-cache]', message, meta);
  } else {
    console.info('[offline-cache]', message);
  }
};

export const generateCacheKey = (
  ...parts: Array<string | number | boolean | null | undefined>
) =>
  parts
    .filter((part) => part !== undefined && part !== null && part !== '')
    .map((part) => String(part))
    .join('::');

export const isCacheValid = (updatedAt: number, ttl = CACHE_TTL_MS) =>
  Date.now() - updatedAt <= ttl;

export const readCache = async <T>(store: StoreName, key: string) => {
  try {
    const db = await getDb();
    const record = (await db.get(store, key)) as CacheRecord<T> | undefined;
    if (!record) return null;
    if (!isCacheValid(record.updatedAt)) return null;
    return record.data;
  } catch (error) {
    console.warn('[offline-cache] read failed', { store, key, error });
    return null;
  }
};

export const writeCache = async <T>(store: StoreName, key: string, data: T) => {
  try {
    const db = await getDb();
    const record: CacheRecord<T> = { key, data, updatedAt: Date.now() };
    await db.put(store, record);
  } catch (error) {
    console.warn('[offline-cache] write failed', { store, key, error });
  }
};

export const clearExpiredCache = async (ttl = CACHE_TTL_MS) => {
  const now = Date.now();
  let removed = 0;

  try {
    const db = await getDb();
    for (const store of Object.values(STORES)) {
      try {
        const tx = db.transaction(store, 'readwrite');
        const records = (await tx.store.getAll()) as CacheRecord<unknown>[];
        for (const record of records) {
          if (!isCacheValid(record.updatedAt, ttl)) {
            await tx.store.delete(record.key);
            removed += 1;
          }
        }
        await tx.done;
      } catch (error) {
        console.warn('[offline-cache] cleanup failed', { store, error });
      }
    }
  } catch (error) {
    console.warn('[offline-cache] cleanup failed to open DB', { error });
  }

  console.info('[offline-cache] cleanup complete', { removed });
  return removed;
};
