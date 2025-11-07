import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/lib/openai';

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
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const tone = await prisma.tone.findFirst({
      where: { id: context.params.id, userId: user.id },
    });

    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    return NextResponse.json({ message: 'Successfully fetched tone', tone }, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch tone ${context.params.id} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch tone' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const tone = await prisma.tone.findFirst({
      where: { id: context.params.id, userId: user.id },
    });
    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    const body: ToneUpdateBody = await req.json();

    const gearChanged =
      body.guitar !== undefined ||
      body.pickups !== undefined ||
      body.strings !== undefined ||
      body.amp !== undefined ||
      body.pedals !== undefined;

    let aiResult: any = {
      ampSettings: body.settings ?? tone.settings,
      pedalChain: body.pedals ?? tone.pedals,
      notes: tone.aiNotes ?? '',
    };

    if (gearChanged) {
      const artistSong = body.artist ?? tone.artist ?? 'Unknown Artist/Song';
      const guitarMakeModel = body.guitar ?? tone.guitar ?? 'Unknown Guitar';
      const ampMakeModel = body.amp ?? tone.amp ?? 'Unknown Amp';
      const pickupsDesc = body.pickups ?? tone.pickups ?? 'default';
      const stringsDesc = body.strings ?? tone.strings ?? 'default';
      const pedalsDesc =
        body.pedals && Array.isArray(body.pedals)
          ? body.pedals.map((p: any) => p.name).join(', ')
          : tone.pedals && Array.isArray(tone.pedals)
            ? tone.pedals.map((p: any) => p.name).join(', ')
            : 'none';

      const openAIResponse = await client.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: `
              You are a professional guitar tone engineer.
              Analyze a user's desired tone based on artist/song and gear (guitar, pickups, strings, amp, pedals) and return precise amp and pedal settings.
              Output in JSON format:
              {
                "ampSettings": { "gain": number, "treble": number, "mid": number, "bass": number, "volume": number },
                "pedalChain": [ { "name": string, "settings": object } ],
                "notes": string
              }
              Keep explanations short and technical.`.trim(),
          },
          {
            role: 'user',
            content: `
              Artist/Song: ${artistSong}
              Guitar: ${guitarMakeModel}
              Pickups: ${pickupsDesc}
              Strings: ${stringsDesc}
              Amp: ${ampMakeModel}
              Pedals: ${pedalsDesc}`.trim(),
          },
        ],
      });

      try {
        aiResult = JSON.parse(openAIResponse.choices?.[0]?.message?.content?.trim() || '{}');
      } catch (err) {
        console.warn('Failed to parse AI response, storing raw text', err);
        aiResult = {
          ampSettings: body.settings ?? tone.settings,
          pedalChain: body.pedals ?? tone.pedals,
          notes: openAIResponse.choices?.[0]?.message?.content?.trim() ?? '',
        };
      }
    }

    const updatedTone = await prisma.tone.update({
      where: { id: context.params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.artist && { artist: body.artist }),
        ...(body.guitar && { guitar: body.guitar }),
        ...(body.pickups && { pickups: body.pickups }),
        ...(body.strings && { strings: body.strings }),
        ...(body.amp && { amp: body.amp }),
        ...(body.clipUrl && { clipUrl: body.clipUrl }),
        pedals: aiResult.pedalChain,
        settings: aiResult.ampSettings,
        aiNotes: aiResult.notes,
      },
    });

    return NextResponse.json(
      { message: 'Successfully updated tone', tone: updatedTone },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Failed to update tone ${context.params.id} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to update tone' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const tone = await prisma.tone.findFirst({
      where: { id: context.params.id, userId: user.id },
    });
    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    await prisma.tone.delete({ where: { id: context.params.id } });

    return NextResponse.json({ message: 'Successfully deleted tone' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete tone ${context.params.id} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to delete tone' }, { status: 500 });
  }
}
