import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';
import type { AIToneResult, ToneGearConfig } from './toneAiService';

// Initialize Redis client
const redis = Redis.fromEnv();

// Cache TTL: 30 days (in seconds)
const CACHE_TTL = 60 * 60 * 24 * 30;

/**
 * Generates a deterministic cache key from tone configuration
 * Uses SHA-256 hash to create a consistent, collision-resistant key
 */
function generateCacheKey(config: ToneGearConfig): string {
  // Normalize inputs to ensure consistent caching
  const normalizedConfig = {
    artist: config.artist.toLowerCase().trim(),
    description: config.description.toLowerCase().trim(),
    guitar: config.guitar.toLowerCase().trim(),
    pickups: config.pickups.toLowerCase().trim(),
    strings: config.strings.toLowerCase().trim(),
    amp: config.amp.toLowerCase().trim(),
  };

  // Create hash from normalized config
  const configString = JSON.stringify(normalizedConfig);
  const hash = createHash('sha256').update(configString).digest('hex');

  return `tone:v1:${hash}`;
}

/**
 * Retrieves cached tone result if available
 * @param config - The gear configuration
 * @returns Cached result or null if not found
 */
export async function getCachedTone(config: ToneGearConfig): Promise<AIToneResult | null> {
  try {
    const cacheKey = generateCacheKey(config);
    const cached = await redis.get<AIToneResult>(cacheKey);

    if (cached) {
      console.log('Cache hit for tone request:', cacheKey);
      return cached;
    }

    console.log('Cache miss for tone request:', cacheKey);
    return null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    // Fail gracefully - return null to proceed with API call
    return null;
  }
}

/**
 * Stores tone result in cache
 * @param config - The gear configuration
 * @param result - The AI-generated tone result
 */
export async function setCachedTone(config: ToneGearConfig, result: AIToneResult): Promise<void> {
  try {
    const cacheKey = generateCacheKey(config);
    await redis.set(cacheKey, result, { ex: CACHE_TTL });
    console.log('Cached tone result:', cacheKey);
  } catch (error) {
    console.error('Error storing in cache:', error);
    // Fail gracefully - don't throw error if caching fails
  }
}

/**
 * Invalidates a specific cached tone
 * Useful for "regenerate" functionality
 * @param config - The gear configuration to invalidate
 */
export async function invalidateCachedTone(config: ToneGearConfig): Promise<void> {
  try {
    const cacheKey = generateCacheKey(config);
    await redis.del(cacheKey);
    console.log('Invalidated cached tone:', cacheKey);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

/**
 * Gets cache statistics (useful for monitoring)
 */
export async function getCacheStats(): Promise<{ totalKeys: number }> {
  try {
    // Get all tone cache keys
    const keys = await redis.keys('tone:v1:*');
    return { totalKeys: keys.length };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalKeys: 0 };
  }
}
