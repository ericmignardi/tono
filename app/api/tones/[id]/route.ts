import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';

interface ToneUpdateBody {
  name?: string;
  artist?: string;
  guitar?: string;
  pickups?: string;
  strings?: string;
  amp?: string;
  pedals?: any;
  settings?: any;
  clipUrl?: string;
  aiAmpSettings?: any;
  aiPedalChain?: any;
  aiNotes?: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const tone = await prisma.tone.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    return NextResponse.json({ message: 'Successfully fetched tone', tone }, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch tone ${params.id} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch tone' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const tone = await prisma.tone.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    const body: ToneUpdateBody = await req.json();

    const updatedTone = await prisma.tone.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.artist && { artist: body.artist }),
        ...(body.guitar && { guitar: body.guitar }),
        ...(body.pickups && { pickups: body.pickups }),
        ...(body.strings && { strings: body.strings }),
        ...(body.amp && { amp: body.amp }),
        ...(body.pedals && { pedals: body.pedals }),
        ...(body.settings && { settings: body.settings }),
        ...(body.clipUrl && { clipUrl: body.clipUrl }),
        ...(body.aiAmpSettings && { aiAmpSettings: body.aiAmpSettings }),
        ...(body.aiPedalChain && { aiPedalChain: body.aiPedalChain }),
        ...(body.aiNotes && { aiNotes: body.aiNotes }),
      },
    });

    return NextResponse.json({ message: 'Tone updated', tone: updatedTone }, { status: 200 });
  } catch (error) {
    console.error(`Failed to update tone ${params.id} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to update tone' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const tone = await prisma.tone.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    await prisma.tone.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Tone deleted' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete tone ${params.id} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to delete tone' }, { status: 500 });
  }
}
