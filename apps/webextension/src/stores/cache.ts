import { browser } from '$app/environment';
import debounce from 'debounce';

const CachesTtlStorageKey = 'caches_ttl';
let CachesTtl: Map<string, number>;
let CacheIsDirty = false;

function getCacheKey(key: string) {
  return `cache_${key}`;
}

function saveCacheTtl() {
  if (!CacheIsDirty) return;
  if (browser) {
    localStorage.setItem(CachesTtlStorageKey, JSON.stringify(Array.from(CachesTtl.entries())));
  }
  CacheIsDirty = false;
}

const saveCacheTtlDebounced = debounce(saveCacheTtl, 1000);

function updateCacheEntry(data: any, cacheKey: string, ttl: number) {
  CachesTtl.set(cacheKey, Date.now() + ttl);
  if (browser) {
    localStorage.setItem(cacheKey, JSON.stringify(data));
  }
  CacheIsDirty = true;
  saveCacheTtlDebounced();
}

export function getCached<T>(key: string): T | null {
  const cacheKey = getCacheKey(key);
  if ((CachesTtl.get(cacheKey) || 0) <= Date.now() || !browser) {
    return null;
  }

  const dataStr = localStorage.getItem(cacheKey);
  if (dataStr) {
    return JSON.parse(dataStr);
  }

  return null;
}

export function cache<T>(key: string, generator: () => Promise<T> | T, ttl: number): Promise<T> | T {
  const cacheKey = getCacheKey(key);

  let data: T | undefined;
  let needRefresh = false;
  if ((CachesTtl.get(cacheKey) || 0) <= Date.now() || !browser) {
    needRefresh = true;
  } else {
    const dataStr = localStorage.getItem(cacheKey);
    if (dataStr) {
      data = JSON.parse(dataStr);
    } else {
      needRefresh = true;
    }
  }

  if (needRefresh) {
    const generatorResult = generator();
    if (generatorResult instanceof Promise) {
      return generatorResult.then(data => {
        updateCacheEntry(data, cacheKey, ttl);
        return data;
      });
    } else {
      data = generatorResult;
      updateCacheEntry(data, cacheKey, ttl);
    }
  }

  return <T>data;
}

export function forceDropCache(key: string) {
  const cacheKey = getCacheKey(key);
  CachesTtl.delete(cacheKey);
  if (browser) {
    localStorage.removeItem(cacheKey);
  }
  CacheIsDirty = true;
  saveCacheTtlDebounced();
}

export function setupCacheHouseKeeping() {
  if (!CachesTtl) {
    CacheIsDirty = false;
    if (browser) {
      const cacheTtlStr = localStorage.getItem(CachesTtlStorageKey);
      CachesTtl = new Map<string, number>(cacheTtlStr ? JSON.parse(cacheTtlStr) : []);
    } else {
      CachesTtl = new Map<string, number>([]);
    }
  }

  function housekeep() {
    if (CachesTtl.size <= 0) return;
    const now = Date.now();
    CachesTtl.forEach((expiresAt, key) => {
      if (expiresAt <= now) {
        CachesTtl.delete(key);
        if (browser) {
          localStorage.removeItem(key);
        }
        CacheIsDirty = true;
      }
    });

    if (CacheIsDirty) {
      saveCacheTtl();
    }
  }

  housekeep();
  if (browser) {
    window.addEventListener('beforeunload', housekeep);
  }

  return () => {
    if (browser) {
      window.removeEventListener('beforeunload', housekeep);
    }
  };
}
