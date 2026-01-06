import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';
import type { AIToneResult, ToneGearConfig } from './toneAiService';

const redis = Redis.fromEnv();
const CACHE_TTL = 60 * 60 * 24 * 30;

function generateCacheKey(config: ToneGearConfig): string {
  const normalizedConfig = {
    artist: config.artist.toLowerCase().trim(),
    description: config.description.toLowerCase().trim(),
    guitar: config.guitar.toLowerCase().trim(),
    pickups: config.pickups.toLowerCase().trim(),
    strings: config.strings.toLowerCase().trim(),
    amp: config.amp.toLowerCase().trim(),
  };

  const configString = JSON.stringify(normalizedConfig);
  const hash = createHash('sha256').update(configString).digest('hex');

  return `tone:v1:${hash}`;
}

export async function getCachedTone(config: ToneGearConfig): Promise<AIToneResult | null> {
  try {
    const cacheKey = generateCacheKey(config);
    const cached = await redis.get<AIToneResult>(cacheKey);

    if (cached) {
      return cached;
    }

    return null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
}

export async function setCachedTone(config: ToneGearConfig, result: AIToneResult): Promise<void> {
  try {
    const cacheKey = generateCacheKey(config);
    await redis.set(cacheKey, result, { ex: CACHE_TTL });
  } catch (error) {
    console.error('Error storing in cache:', error);
  }
}

export async function invalidateCachedTone(config: ToneGearConfig): Promise<void> {
  try {
    const cacheKey = generateCacheKey(config);
    await redis.del(cacheKey);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

export async function getCacheStats(): Promise<{ totalKeys: number }> {
  try {
    const keys = await redis.keys('tone:v1:*');
    return { totalKeys: keys.length };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalKeys: 0 };
  }
}
