import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/database';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { generateEnhancedToneSettings } from '@/lib/gemini/toneAiService';
import { analyzeAudioTone, validateAudioFile } from '@/lib/gemini/audioAnalysisService';
import { getUserTier, canUseAudioAnalysis } from '@/lib/config/subscriptionTiers';
import { toneRateLimit, apiRateLimit } from '@/lib/rateLimit';
import { ToneQuerySchema } from '@/utils/validation/toneValidation';
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

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { subscriptions: true },
    });

    if (!dbUser) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Parse multipart form data
    const formData = await req.formData();

    // Extract form fields
    const name = formData.get('name') as string;
    const artist = formData.get('artist') as string;
    const description = formData.get('description') as string;
    const guitar = formData.get('guitar') as string;
    const pickups = formData.get('pickups') as string;
    const strings = formData.get('strings') as string;
    const amp = formData.get('amp') as string;
    const audioFile = formData.get('audioFile') as File | null;

    // Validate required fields
    if (!name || !artist || !description || !guitar || !pickups || !amp) {
      throw new APIError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    // Check if user is trying to use audio analysis
    let audioAnalysis = null;
    if (audioFile) {
      // Check subscription status
      const hasActiveSubscription = dbUser.subscriptions.some((sub) => sub.status === 'active');
      const userTier = getUserTier(hasActiveSubscription);

      if (!canUseAudioAnalysis(userTier)) {
        throw new APIError(
          'Audio analysis is only available for Pro subscribers',
          403,
          'FEATURE_NOT_AVAILABLE'
        );
      }

      // Validate audio file
      const validation = validateAudioFile(audioFile);
      if (!validation.valid) {
        throw new APIError(validation.error!, 400, 'INVALID_AUDIO_FILE');
      }

      // Process audio file
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      // Try to analyze audio with Gemini (but don't fail if it doesn't work)
      try {
        audioAnalysis = await analyzeAudioTone(audioBuffer, audioFile.type);
        console.log('Audio analysis successful');
      } catch (audioError) {
        console.warn('Audio analysis failed, continuing without it:', audioError);
        // Continue without audio analysis - will use text-only generation
      }
    }

    // Check and reserve credit inside a transaction
    await prisma.$transaction(async (tx) => {
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

      // Reserve the credit
      await tx.user.update({
        where: { id: dbUser.id },
        data: { generationsUsed: { increment: 1 } },
      });
    });

    // Generate AI settings (enhanced with audio analysis if provided)
    const aiResult = await generateEnhancedToneSettings(
      {
        artist,
        description,
        guitar,
        pickups,
        strings,
        amp,
      },
      audioAnalysis || undefined
    );

    // Create the tone with AI results and audio analysis
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
        audioAnalysis: audioAnalysis ? (audioAnalysis as any) : null,
      },
    });

    revalidatePath('/dashboard/tones');

    console.log(
      JSON.stringify({
        requestId,
        action: 'tone_created',
        toneId: tone.id,
        userId: dbUser.id,
        hasAudioAnalysis: !!audioAnalysis,
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
      page: req.nextUrl.searchParams.get('page') || undefined,
      limit: req.nextUrl.searchParams.get('limit') || undefined,
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
