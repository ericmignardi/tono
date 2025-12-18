import { NextRequest, NextResponse } from 'next/server';
import { generateToneSettings } from '@/lib/gemini/toneAiService';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { ToneCreateSchema } from '@/utils/validation/toneValidation';
import { APIError, handleAPIError, logRequest } from '@/lib/api/errorHandler';
import { randomUUID } from 'crypto';

// Strict rate limiter for guest access: 2 requests per 24 hours per IP
const guestRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, '24 h'),
  analytics: true,
  prefix: 'ratelimit:guest',
});

// Partial schema for guest form (simplified)
const GuestToneSchema = ToneCreateSchema.pick({
  artist: true,
  guitar: true,
  amp: true,
});

export async function POST(req: NextRequest) {
  const requestId = randomUUID();

  try {
    // 1. IP-Based Rate Limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'anonymous';
    const { success } = await guestRateLimit.limit(ip);

    if (!success) {
      throw new APIError(
        'Guest limit reached. Please sign in to create more tones!',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    logRequest({
      requestId,
      method: 'POST',
      path: '/api/tones/guest',
      userId: `guest_${ip}`,
    });

    // 2. Validation
    const body = await req.json();
    const parsed = GuestToneSchema.safeParse(body);

    if (!parsed.success) {
      throw new APIError('Invalid input data', 400, 'VALIDATION_ERROR', parsed.error.issues);
    }

    const { artist, guitar, amp } = parsed.data;

    // 3. AI Generation (No DB Persistence)
    const result = await generateToneSettings({
      artist,
      guitar,
      amp,
      // Default values for guest
      description: `Recreate the tone of ${artist} using a ${guitar} and ${amp}`,

      pickups: 'Standard',
      strings: 'Regular',
    });

    console.log(`[Guest] Generated tone for IP: ${ip}`);

    // 4. Return Result (Frontend will show "blur" effect or "SignUp to Save")
    return NextResponse.json(
      {
        message: 'Tone generated successfully',
        data: result, // { ampSettings, notes }
      },
      { status: 200 }
    );
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}
