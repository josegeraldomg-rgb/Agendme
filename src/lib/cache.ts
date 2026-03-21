// Global in-memory cache service with TTL, invalidation, and metrics

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number; // seconds
  createdAt: number;
  expiresAt: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  totalEntries: number;
  memoryEstimateKb: number;
}

interface CacheInvalidationLog {
  key: string;
  reason: string;
  timestamp: number;
}

const DEFAULT_TTL: Record<string, number> = {
  permissoes: 3600,
  configuracoes: 7200,
  dashboards: 300,
  sessoes: 1800,
  pacientes: 600,
  servicos: 900,
  agenda: 120,
  whitelabel: 7200,
  api: 300,
};

class GlobalCache {
  private store = new Map<string, CacheEntry>();
  private metrics: CacheMetrics = { hits: 0, misses: 0, sets: 0, invalidations: 0, totalEntries: 0, memoryEstimateKb: 0 };
  private invalidationLogs: CacheInvalidationLog[] = [];
  private moduleConfig = new Map<string, { ttl: number; active: boolean }>();

  constructor() {
    Object.entries(DEFAULT_TTL).forEach(([mod, ttl]) => {
      this.moduleConfig.set(mod, { ttl, active: true });
    });
    // Cleanup expired entries every 30s
    setInterval(() => this.cleanup(), 30_000);
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) { this.metrics.misses++; return null; }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.metrics.misses++;
      this.updateEntryCount();
      return null;
    }
    this.metrics.hits++;
    return entry.value as T;
  }

  set<T = unknown>(key: string, value: T, ttlOverride?: number): void {
    const module = key.split(":")[0];
    const cfg = this.moduleConfig.get(module);
    if (cfg && !cfg.active) return;
    const ttl = ttlOverride ?? cfg?.ttl ?? 300;
    const now = Date.now();
    this.store.set(key, { key, value, ttl, createdAt: now, expiresAt: now + ttl * 1000 });
    this.metrics.sets++;
    this.updateEntryCount();
  }

  invalidate(key: string, reason = "manual"): boolean {
    const existed = this.store.delete(key);
    if (existed) {
      this.metrics.invalidations++;
      this.invalidationLogs.push({ key, reason, timestamp: Date.now() });
      if (this.invalidationLogs.length > 500) this.invalidationLogs.shift();
      this.updateEntryCount();
    }
    return existed;
  }

  invalidateByPrefix(prefix: string, reason = "bulk"): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) { this.invalidate(key, reason); count++; }
    }
    return count;
  }

  clearAll(reason = "clear_all"): void {
    const count = this.store.size;
    this.store.clear();
    this.metrics.invalidations += count;
    this.invalidationLogs.push({ key: "*", reason, timestamp: Date.now() });
    this.updateEntryCount();
  }

  getMetrics(): CacheMetrics { return { ...this.metrics }; }

  getInvalidationLogs(): CacheInvalidationLog[] { return [...this.invalidationLogs]; }

  getEntries(): CacheEntry[] {
    const now = Date.now();
    return Array.from(this.store.values()).filter(e => e.expiresAt > now);
  }

  getModuleConfig(): Array<{ module: string; ttl: number; active: boolean }> {
    return Array.from(this.moduleConfig.entries()).map(([module, cfg]) => ({ module, ...cfg }));
  }

  setModuleConfig(module: string, ttl: number, active: boolean): void {
    this.moduleConfig.set(module, { ttl, active });
    if (!active) this.invalidateByPrefix(module + ":", "module_disabled");
  }

  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total === 0 ? 0 : Math.round((this.metrics.hits / total) * 100);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
    this.updateEntryCount();
  }

  private updateEntryCount(): void {
    this.metrics.totalEntries = this.store.size;
    this.metrics.memoryEstimateKb = Math.round(this.store.size * 2.5);
  }
}

export const globalCache = new GlobalCache();

// Convenience hook-compatible helpers
export function cacheGet<T>(key: string): T | null { return globalCache.get<T>(key); }
export function cacheSet<T>(key: string, value: T, ttl?: number): void { globalCache.set(key, value, ttl); }
export function cacheInvalidate(key: string, reason?: string): boolean { return globalCache.invalidate(key, reason); }
export function cacheInvalidateModule(module: string): number { return globalCache.invalidateByPrefix(module + ":"); }
