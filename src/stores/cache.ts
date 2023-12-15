import { browser } from '$app/environment';
import { storage } from './storage';

const CachesTtlStorageKey = 'caches_ttl';
let CachesTtl: Map<string, number>;
const NotFoundObject = { NOT_FOUND: true };

export async function cache<T>(key: string, generator: () => Promise<T> | T, ttl: number) {
  const cacheKey = `cache_${key}`;
  if (!CachesTtl) {
    CachesTtl = new Map<string, number>((await storage.local.get(CachesTtlStorageKey))[CachesTtlStorageKey]);
  }

  let data: T | undefined;
  let needRefresh = false;
  if ((CachesTtl.get(cacheKey) || 0) < new Date().valueOf()) {
    needRefresh = true;
  } else {
    data = (await storage.local.get({ [cacheKey]: NotFoundObject }))[cacheKey];
    if (data === NotFoundObject) {
      needRefresh = true;
      data = undefined;
    }
  }

  if (needRefresh) {
    data = await generator();
    CachesTtl.set(cacheKey, new Date().valueOf() + ttl);
    await storage.local.set({
      [CachesTtlStorageKey]: Array.from(CachesTtl.entries()),
      [cacheKey]: data,
    });
  }

  return data;
}

export async function setupCacheHouseKeeping() {
  if (!browser) return;
  if (!CachesTtl) {
    CachesTtl = new Map<string, number>((await storage.local.get(CachesTtlStorageKey))[CachesTtlStorageKey]);
  }

  async function housekeep() {
    if (CachesTtl.size <= 0) return;
    const expiredCacheKeys: string[] = [];
    const now = new Date().valueOf();
    CachesTtl.forEach((expiresAt, key) => {
      if (expiresAt <= now) {
        expiredCacheKeys.push(key);
      }
    });

    if (expiredCacheKeys.length > 0) {
      expiredCacheKeys.forEach(key => CachesTtl.delete(key));
      await Promise.all([
        storage.local.remove(expiredCacheKeys),
        storage.local.set({ [CachesTtlStorageKey]: Array.from(CachesTtl.entries()) }),
      ]);
    }
  }

  await housekeep();
  const intervalRef = setInterval(housekeep, 60000);

  return () => clearInterval(intervalRef);
}
