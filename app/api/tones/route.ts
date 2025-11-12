import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { generateToneSettings } from '@/lib/services/toneAiService';

interface ToneCreateBody {
  name: string;
  artist: string;
  description: string;
  guitar: string;
  pickups: string;
  strings: string;
  amp: string;
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
    }

    const body: ToneCreateBody = await req.json();
    const { name, artist, description, guitar, pickups, strings, amp } = body;

    const aiResult = await generateToneSettings({
      artist,
      description,
      guitar,
      pickups,
      strings,
      amp,
    });

    const tone = await prisma.tone.create({
      data: {
        userId: dbUser.id,
        name: name ?? '',
        artist: artist ?? '',
        description: description ?? '',
        guitar: guitar ?? '',
        pickups: pickups ?? '',
        strings: strings ?? '',
        amp: amp ?? '',
        aiAmpSettings: aiResult.ampSettings,
        aiNotes: aiResult.notes,
      },
    });

    revalidatePath('/dashboard/tones');

    return NextResponse.json({ message: 'Successfully created tone', tone }, { status: 201 });
  } catch (error) {
    console.error(`Failed to create tone for user ${user.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to create tone',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
    }

    const tones = await prisma.tone.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ message: 'Successfully fetched tones', tones }, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch tones for user ${user.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to fetch tones',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
