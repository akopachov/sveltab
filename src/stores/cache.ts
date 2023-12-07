import { getStorage } from "./storage";

interface CacheItem<T> {
  expiresAt: number;
  data: T;
}

export async function cache<T>(key: string, generator: (() => (Promise<T> | T)), ttl: number) {
  const storage = await getStorage();
  const data = <Record<string, CacheItem<T>>>(await storage.local.get(key));
  if (!(key in data) || data[key].expiresAt >= new Date().valueOf()) {
    data[key] = { data: await generator(), expiresAt: new Date().valueOf() + ttl };
    await storage.local.set(data); 
  }

  return data[key].data;
}
