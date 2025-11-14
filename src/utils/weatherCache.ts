import { WeatherData } from './weatherService';

interface CacheEntry {
  data: WeatherData[];
  timestamp: number;
}

// Cache duration: 1 hour
const CACHE_DURATION_MS = 60 * 60 * 1000;

class WeatherCache {
  private cache: Map<string, CacheEntry> = new Map();

  private generateKey(destination: string, startDate: string, endDate: string): string {
    return `${destination}-${startDate}-${endDate}`;
  }

  get(destination: string, startDate: string, endDate: string): WeatherData[] | null {
    const key = this.generateKey(destination, startDate, endDate);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache is still valid
    if (age > CACHE_DURATION_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(destination: string, startDate: string, endDate: string, data: WeatherData[]): void {
    const key = this.generateKey(destination, startDate, endDate);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean up old entries (simple LRU-like behavior)
    this.cleanupOldEntries();
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    // Find expired entries
    this.cache.forEach((entry, key) => {
      const age = now - entry.timestamp;
      if (age > CACHE_DURATION_MS) {
        keysToDelete.push(key);
      }
    });

    // Delete expired entries
    keysToDelete.forEach(key => this.cache.delete(key));

    // If cache is still too large (>50 entries), remove oldest
    if (this.cache.size > 50) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const entriesToRemove = entries.slice(0, this.cache.size - 50);
      entriesToRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache stats for debugging
  getStats(): { size: number; entries: Array<{ key: string; age: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Math.floor((now - entry.timestamp) / 1000) // age in seconds
    }));

    return {
      size: this.cache.size,
      entries
    };
  }
}

// Export singleton instance
export const weatherCache = new WeatherCache();
