import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { regenerateToneSettings } from '@/lib/services/toneAiService';
import type { AmpSettings, AIToneResult } from '@/lib/services/toneAiService';

interface ToneUpdateBody {
  name?: string;
  artist?: string;
  description?: string;
  guitar?: string;
  pickups?: string;
  strings?: string;
  amp?: string;
  clipUrl?: string;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });

  if (!dbUser) return NextResponse.json({ message: 'User not found in database' }, { status: 404 });

  try {
    const tone = await prisma.tone.findFirst({
      where: { id: params.id, userId: dbUser.id },
    });

    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    return NextResponse.json({ message: 'Successfully fetched tone', tone }, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch tone ${params.id} for user ${user.id}:`, error);
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

  if (!dbUser) return NextResponse.json({ message: 'User not found in database' }, { status: 404 });

  const body: ToneUpdateBody = await req.json();

  try {
    const tone = await prisma.tone.findUnique({
      where: { id: params.id },
    });

    if (!tone || tone.userId !== dbUser.id)
      return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    const gearChanged =
      body.artist !== undefined ||
      body.description !== undefined ||
      body.guitar !== undefined ||
      body.pickups !== undefined ||
      body.strings !== undefined ||
      body.amp !== undefined;

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
          artist: body.artist ?? tone.artist ?? '',
          description: body.description ?? tone.description ?? '',
          guitar: body.guitar ?? tone.guitar ?? '',
          pickups: body.pickups ?? tone.pickups ?? '',
          strings: body.strings ?? tone.strings ?? '',
          amp: body.amp ?? tone.amp ?? '',
        },
        aiResult
      );
    }

    const updatedTone = await prisma.tone.update({
      where: { id: params.id },
      data: {
        ...body,
        aiAmpSettings: aiResult.ampSettings,
        aiNotes: aiResult.notes,
      },
    });

    revalidatePath('/dashboard/tones');

    return NextResponse.json(
      { message: 'Successfully updated tone', tone: updatedTone },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Failed to update tone ${params.id} for user ${user.id}:`, error);
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

  if (!dbUser) return NextResponse.json({ message: 'User not found in database' }, { status: 404 });

  try {
    const tone = await prisma.tone.findFirst({
      where: { id: params.id, userId: dbUser.id },
    });

    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    await prisma.tone.delete({
      where: { id: params.id },
    });

    revalidatePath('/dashboard/tones');

    return NextResponse.json({ message: 'Successfully deleted tone' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete tone ${params.id} for user ${user.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to delete tone',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
