import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/database';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { generateToneSettings } from '@/lib/openai/toneAiService';
import { toneRateLimit, apiRateLimit } from '@/lib/rateLimit';
import { ToneCreateSchema, ToneQuerySchema } from '@/utils/validation/toneValidation';
import { ToneCreateBody } from '@/types/tone/toneValidationTypes';
import { APIError, handleAPIError, logRequest } from '@/lib/api/errorHandler';
import { randomUUID } from 'crypto';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const user = await currentUser();
    if (!user) {
      throw new APIError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    logRequest({
      requestId,
      method: 'POST',
      path: '/api/tones',
      userId: user.id,
    });

    const { success } = await toneRateLimit.limit(user.id);
    if (!success) {
      throw new APIError(
        'Too many tone generation requests. Please slow down.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    const body: ToneCreateBody = await req.json();

    const parsed = ToneCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new APIError('Invalid input data', 400, 'VALIDATION_ERROR', parsed.error.issues);
    }

    const { name, artist, description, guitar, pickups, strings, amp } = parsed.data;

    // Check and reserve credit inside a transaction to prevent race conditions
    await prisma.$transaction(async (tx) => {
      // Get fresh user data inside transaction
      const freshUser = await tx.user.findUnique({
        where: { id: dbUser.id },
        select: { generationsUsed: true, generationsLimit: true },
      });

      if (!freshUser || freshUser.generationsUsed >= freshUser.generationsLimit) {
        throw new APIError(
          'No remaining credits. Please upgrade your plan.',
          403,
          'CREDITS_EXHAUSTED'
        );
      }

      // Reserve the credit immediately
      await tx.user.update({
        where: { id: dbUser.id },
        data: { generationsUsed: { increment: 1 } },
      });
    });

    // Generate AI settings after credit is reserved
    const aiResult = await generateToneSettings({
      artist,
      description,
      guitar,
      pickups,
      strings,
      amp,
    });

    // Create the tone with the AI results
    const tone = await prisma.tone.create({
      data: {
        userId: dbUser.id,
        name,
        artist,
        description,
        guitar,
        pickups,
        strings,
        amp,
        aiAmpSettings: aiResult.ampSettings,
        aiNotes: aiResult.notes,
      },
    });

    revalidatePath('/dashboard/tones');

    console.log(
      JSON.stringify({
        requestId,
        action: 'tone_created',
        toneId: tone.id,
        userId: dbUser.id,
      })
    );

    return NextResponse.json({ message: 'Successfully created tone', tone }, { status: 201 });
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}

export async function GET(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const user = await currentUser();
    if (!user) {
      throw new APIError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    logRequest({
      requestId,
      method: 'GET',
      path: '/api/tones',
      userId: user.id,
    });

    // Lighter rate limit for read operations
    const { success } = await apiRateLimit.limit(user.id);
    if (!success) {
      throw new APIError('Too many requests. Please slow down.', 429, 'RATE_LIMIT_EXCEEDED');
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });
    if (!dbUser) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    const queryParsed = ToneQuerySchema.safeParse({
      page: req.nextUrl.searchParams.get('page'),
      limit: req.nextUrl.searchParams.get('limit'),
    });
    if (!queryParsed.success) {
      throw new APIError(
        'Invalid query parameters',
        400,
        'VALIDATION_ERROR',
        queryParsed.error.issues
      );
    }

    const { page, limit } = queryParsed.data;

    const [tones, total] = await Promise.all([
      prisma.tone.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tone.count({ where: { userId: dbUser.id } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        message: 'Successfully fetched tones',
        tones,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}
