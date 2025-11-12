import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

export const toneRateLimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
});
