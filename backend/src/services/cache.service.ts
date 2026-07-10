import NodeCache from "node-cache";

const ttl = Number(process.env.CACHE_TTL_SECONDS || 300);

class CacheService {
  private store: NodeCache;

  constructor() {
    this.store = new NodeCache({ stdTTL: ttl, checkperiod: ttl * 0.2, useClones: false });
  }

  get<T>(key: string): T | undefined {
    return this.store.get<T>(key);
  }

  set<T>(key: string, value: T, ttlOverride?: number): boolean {
    return ttlOverride ? this.store.set(key, value, ttlOverride) : this.store.set(key, value);
  }

  del(key: string): number {
    return this.store.del(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  flush(): void {
    this.store.flushAll();
  }

  /**
   * Memoize an async function result under a cache key.
   */
  async remember<T>(key: string, fn: () => Promise<T>, ttlOverride?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const result = await fn();
    this.set(key, result, ttlOverride);
    return result;
  }
}

export const cacheService = new CacheService();
export default cacheService;
