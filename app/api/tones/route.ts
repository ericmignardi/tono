import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/lib/openai';

interface ToneCreateBody {
  text: string;
  name?: string;
  artist?: string;
  guitar?: string;
  pickups?: string;
  strings?: string;
  amp?: string;
  pedals?: any;
  settings?: any;
  clipUrl?: string;
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body: ToneCreateBody = await req.json();
    const { text, name, artist, guitar, pickups, strings, amp, pedals, settings, clipUrl } = body;

    if (!text) return NextResponse.json({ message: 'Text is required' }, { status: 400 });

    const openAIResponse = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: 'Analyze the tone of the following text and suggest amp/pedal settings.',
        },
        { role: 'user', content: `Text: "${text}"` },
      ],
    });

    const aiResult = openAIResponse.choices?.[0]?.message?.content?.trim() ?? 'Unknown';

    const tone = await prisma.tone.create({
      data: {
        userId: user.id,
        name: name ?? text.slice(0, 50),
        artist: artist ?? '',
        guitar: guitar ?? '',
        pickups: pickups ?? '',
        strings: strings ?? '',
        amp: amp ?? '',
        pedals: pedals ?? [],
        settings: settings ?? {},
        clipUrl: clipUrl ?? null,
        aiNotes: aiResult,
      },
    });

    return NextResponse.json(
      { message: 'Successfully created tone', tone, aiResult },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Failed to create tone for user ${user?.id}:`, error);
    return NextResponse.json({ message: 'Failed to create tone' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const tones = await prisma.tone.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tones }, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch tones for user ${user?.id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch tones' }, { status: 500 });
  }
}
