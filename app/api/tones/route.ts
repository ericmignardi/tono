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

    const artistSong = artist ?? 'Unknown Artist/Song';
    const guitarMakeModel = guitar ?? 'Unknown Guitar';
    const ampMakeModel = amp ?? 'Unknown Amp';
    const pedalsDescription =
      pedals && Array.isArray(pedals) ? pedals.map((p) => p.name).join(', ') : 'none';

    const openAIResponse = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: `
            You are a professional guitar tone engineer. 
            Your job is to analyze a user's desired tone based on a specific artist, song, and their gear (guitar, pickups, strings, amp, pedals, etc.) and suggest precise settings for amp and pedals. 

            Requirements:
            1. Focus on recreating the closest tone possible for the given artist/song.
            2. Take into account the user's specific gear and suggest adjustments if needed.
            3. Output the response in JSON format with these fields:
              {
                "ampSettings": { "gain": number, "treble": number, "mid": number, "bass": number, "volume": number },
                "pedalChain": [ { "name": string, "settings": object } ],
                "notes": string
              }
            4. Keep explanations short and technical; do not include unrelated text.
            5. Assume standard tuning unless specified otherwise.`.trim(),
        },
        {
          role: 'user',
          content: `
            Artist/Song: ${artistSong}
            Guitar: ${guitarMakeModel}
            Pickups: ${pickups ?? 'default'}
            Strings: ${strings ?? 'default'}
            Amp: ${ampMakeModel}
            Pedals: ${pedalsDescription}`.trim(),
        },
      ],
    });

    // Parse AI response as JSON
    let aiResult: any = {};
    try {
      aiResult = JSON.parse(openAIResponse.choices?.[0]?.message?.content?.trim() || '{}');
    } catch (err) {
      console.warn('Failed to parse AI response as JSON, storing raw text', err);
      aiResult = { notes: openAIResponse.choices?.[0]?.message?.content?.trim() || 'Unknown' };
    }

    const tone = await prisma.tone.create({
      data: {
        userId: user.id,
        name: name ?? text.slice(0, 50),
        artist: artist ?? '',
        guitar: guitar ?? '',
        pickups: pickups ?? '',
        strings: strings ?? '',
        amp: amp ?? '',
        pedals: aiResult.pedalChain ?? pedals ?? [],
        settings: aiResult.ampSettings ?? settings ?? {},
        clipUrl: clipUrl ?? null,
        aiNotes: aiResult.notes ?? '',
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

    return NextResponse.json({ message: 'Successfully fetched tones', tones }, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch tones for user ${user?.id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch tones' }, { status: 500 });
  }
}
