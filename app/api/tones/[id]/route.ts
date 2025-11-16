import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/database';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { regenerateToneSettings } from '@/lib/openai/toneAiService';
import type { AmpSettings, AIToneResult } from '@/lib/openai/toneAiService';
import { toneRateLimit, apiRateLimit } from '@/lib/rateLimit';
import { ToneUpdateSchema } from '@/utils/validation/toneValidation';
import { ToneUpdateBody } from '@/types/tone/toneValidationTypes';
import { APIError, handleAPIError, logRequest } from '@/lib/api/errorHandler';
import { randomUUID } from 'crypto';

export const maxDuration = 60;

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID();

  try {
    const { id } = await context.params;
    const user = await currentUser();

    if (!user) {
      throw new APIError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    logRequest({
      requestId,
      method: 'GET',
      path: `/api/tones/${id}`,
      userId: user.id,
    });

    // Light rate limit for reads
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

    const tone = await prisma.tone.findFirst({
      where: { id, userId: dbUser.id },
    });

    if (!tone) {
      throw new APIError('Tone not found', 404, 'TONE_NOT_FOUND');
    }

    return NextResponse.json({ message: 'Successfully fetched tone', tone }, { status: 200 });
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID();

  try {
    const { id } = await context.params;
    const user = await currentUser();

    if (!user) {
      throw new APIError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    logRequest({
      requestId,
      method: 'PUT',
      path: `/api/tones/${id}`,
      userId: user.id,
    });

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    const body: ToneUpdateBody = await req.json();
    const parsed = ToneUpdateSchema.safeParse(body);

    if (!parsed.success) {
      throw new APIError('Invalid input data', 400, 'VALIDATION_ERROR');
    }

    const validatedBody = parsed.data;

    const tone = await prisma.tone.findFirst({
      where: { id, userId: dbUser.id },
    });

    if (!tone) {
      throw new APIError('Tone not found', 404, 'TONE_NOT_FOUND');
    }

    // Check if gear fields changed (requires AI regeneration)
    const gearChanged =
      validatedBody.artist !== undefined ||
      validatedBody.description !== undefined ||
      validatedBody.guitar !== undefined ||
      validatedBody.pickups !== undefined ||
      validatedBody.strings !== undefined ||
      validatedBody.amp !== undefined;

    let aiResult: AIToneResult = {
      ampSettings: (tone.aiAmpSettings as AmpSettings) ?? {
        mid: 5,
        bass: 5,
        gain: 5,
        reverb: 5,
        treble: 5,
        volume: 5,
        presence: 5,
      },
      notes: tone.aiNotes ?? '',
    };

    if (gearChanged) {
      // Rate limit AI generation
      const { success } = await toneRateLimit.limit(user.id);
      if (!success) {
        throw new APIError(
          'Too many tone generation requests. Please slow down.',
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      // Check credit limit
      if (dbUser.generationsUsed >= dbUser.generationsLimit) {
        throw new APIError(
          'No remaining credits. Please upgrade your plan.',
          403,
          'CREDITS_EXHAUSTED'
        );
      }

      // Regenerate AI settings
      aiResult = await regenerateToneSettings(
        {
          artist: validatedBody.artist ?? tone.artist ?? '',
          description: validatedBody.description ?? tone.description ?? '',
          guitar: validatedBody.guitar ?? tone.guitar ?? '',
          pickups: validatedBody.pickups ?? tone.pickups ?? '',
          strings: validatedBody.strings ?? tone.strings ?? '.010–.046',
          amp: validatedBody.amp ?? tone.amp ?? '',
        },
        aiResult
      );

      // Increment usage after successful AI generation
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          generationsUsed: { increment: 1 },
        },
      });

      console.log(
        JSON.stringify({
          requestId,
          action: 'tone_regenerated',
          toneId: id,
          userId: dbUser.id,
        })
      );
    }

    const updatedTone = await prisma.tone.update({
      where: { id },
      data: {
        ...validatedBody,
        aiAmpSettings: aiResult.ampSettings,
        aiNotes: aiResult.notes,
      },
    });

    revalidatePath('/dashboard/tones');

    console.log(
      JSON.stringify({
        requestId,
        action: 'tone_updated',
        toneId: id,
        userId: dbUser.id,
        gearChanged,
      })
    );

    return NextResponse.json(
      { message: 'Successfully updated tone', tone: updatedTone },
      { status: 200 }
    );
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID();

  try {
    const { id } = await context.params;
    const user = await currentUser();

    if (!user) {
      throw new APIError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    logRequest({
      requestId,
      method: 'DELETE',
      path: `/api/tones/${id}`,
      userId: user.id,
    });

    // Light rate limit for deletes
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

    const tone = await prisma.tone.findFirst({ where: { id, userId: dbUser.id } });

    if (!tone) {
      throw new APIError('Tone not found', 404, 'TONE_NOT_FOUND');
    }

    await prisma.tone.delete({ where: { id } });
    revalidatePath('/dashboard/tones');

    console.log(
      JSON.stringify({
        requestId,
        action: 'tone_deleted',
        toneId: id,
        userId: dbUser.id,
      })
    );

    return NextResponse.json({ message: 'Successfully deleted tone' }, { status: 200 });
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}
