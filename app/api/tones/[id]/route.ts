import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { regenerateToneSettings } from '@/lib/services/openai/toneAiService';
import type { AmpSettings, AIToneResult } from '@/lib/services/openai/toneAiService';
import { toneRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const ToneUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  artist: z.string().trim().min(1, 'Artist is required').optional(),
  description: z.string().trim().min(1, 'Description is required').optional(),
  guitar: z.string().trim().min(1, 'Guitar is required').optional(),
  pickups: z.string().trim().min(1, 'Pickups are required').optional(),
  strings: z
    .string()
    .optional()
    .default('.010–.046')
    .transform((str) => str?.trim() || '.010–.046'),
  amp: z.string().trim().min(1, 'Amp is required').optional(),
});

interface ToneUpdateBody {
  name?: string;
  artist?: string;
  description?: string;
  guitar?: string;
  pickups?: string;
  strings?: string;
  amp?: string;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  try {
    const tone = await prisma.tone.findFirst({ where: { id: params.id, userId: dbUser.id } });
    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    return NextResponse.json({ message: 'Successfully fetched tone', tone }, { status: 200 });
  } catch (error) {
    console.error(`[Tone GET] Error fetching ${params.id} for user ${user.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to fetch tone',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  const body: ToneUpdateBody = await req.json();
  const parsed = ToneUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: 'Invalid input', errors: parsed.error.format() },
      { status: 400 }
    );

  const validatedBody = parsed.data;

  try {
    const tone = await prisma.tone.findUnique({ where: { id: params.id } });
    if (!tone || tone.userId !== dbUser.id)
      return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    const { success } = await toneRateLimit.limit(user.id);
    if (!success) return NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });

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
    }

    const updatedTone = await prisma.tone.update({
      where: { id: params.id },
      data: { ...validatedBody, aiAmpSettings: aiResult.ampSettings, aiNotes: aiResult.notes },
    });

    revalidatePath('/dashboard/tones');

    return NextResponse.json(
      { message: 'Successfully updated tone', tone: updatedTone },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[Tone PUT] Error updating ${params.id} for user ${user.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to update tone',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  try {
    const tone = await prisma.tone.findFirst({ where: { id: params.id, userId: dbUser.id } });
    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    await prisma.tone.delete({ where: { id: params.id } });

    revalidatePath('/dashboard/tones');

    return NextResponse.json({ message: 'Successfully deleted tone' }, { status: 200 });
  } catch (error) {
    console.error(`[Tone DELETE] Error deleting ${params.id} for user ${user.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to delete tone',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
