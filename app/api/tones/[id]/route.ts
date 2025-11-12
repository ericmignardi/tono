import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/lib/openai';

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const tone = await prisma.tone.findFirst({
      where: { id, userId: user.id },
    });

    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    return NextResponse.json({ message: 'Successfully fetched tone', tone }, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch tone ${id} for user ${user.id}:`, error);

    return NextResponse.json({ message: 'Failed to fetch tone' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();

  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const body: ToneUpdateBody = await req.json();

  try {
    const tone = await prisma.tone.findUnique({
      where: { id, userId: user.id },
    });

    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    const gearChanged =
      body.description !== undefined ||
      body.guitar !== undefined ||
      body.pickups !== undefined ||
      body.strings !== undefined ||
      body.amp !== undefined;

    let aiResult: any = {
      notes: tone.aiNotes ?? '',
    };

    if (gearChanged) {
      const toneDescription = body.description ?? tone.description;
      const artistSong = body.artist ?? tone.artist;
      const guitarMakeModel = body.guitar ?? tone.guitar;
      const ampMakeModel = body.amp ?? tone.amp;
      const pickupsDesc = body.pickups ?? tone.pickups;
      const stringsDesc = body.strings ?? tone.strings;
      const openAIResponse = await client.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a professional guitar tone engineer with deep knowledge of classic and modern guitar tones. Your job is to provide SPECIFIC, ACTIONABLE settings that can be directly applied to the equipment.
                      Output ONLY valid JSON with this exact structure:
                      {
                        "ampSettings": {
                          "gain": number (0-10, in 0.5 increments),
                          "treble": number (0-10, in 0.5 increments),
                          "mid": number (0-10, in 0.5 increments),
                          "bass": number (0-10, in 0.5 increments),
                          "volume": number (0-10, in 0.5 increments),
                          "presence": number (0-10, in 0.5 increments, if applicable),
                          "reverb": number (0-10, in 0.5 increments, if built-in)
                        },
                        "notes": string (2-3 sentences explaining WHY these settings work for this tone)
                      }
                      CRITICAL REQUIREMENTS:
                      1. Analyze the ENTIRE gear setup: guitar model, pickup type (single-coil vs humbucker affects gain/EQ), string gauge, and amp characteristics
                      2. Consider the tone description carefully - match the sonic characteristics (bright/dark, compressed/dynamic, clean/overdriven)
                      3. For amp settings: Be specific with numbers. Consider how the amp model's characteristics (British vs American, tube vs solid-state) affect the settings
                      4. Match pickup characteristics: humbuckers need less gain, single-coils may need more mid boost
                      5. Base recommendations on documented settings from the artist when possible, but adapt to the specific gear provided

                      Keep notes technical but concise - explain the key tonal decisions made.`,
          },
          {
            role: 'user',
            content: `Create a tone preset to match this sonic goal:

                      TARGET TONE:
                      Artist/Song Reference: ${artistSong}
                      Tone Description: ${toneDescription ?? "Match the artist's signature sound"}

                      AVAILABLE GEAR:
                      Guitar: ${guitarMakeModel}
                      Pickups: ${pickupsDesc}
                      Strings: ${stringsDesc}
                      Amp: ${ampMakeModel}

                      INSTRUCTIONS:
                      - Provide EXACT numeric settings for every amp knob
                      - For each pedal used, specify settings for ALL relevant parameters (not just generic suggestions)
                      - Ensure the pedal chain order is technically correct
                      - Account for how THIS specific guitar and pickup combination will interact with the amp
                      - If the available gear can't achieve the exact tone, get as close as possible and explain the compromise in notes`,
          },
        ],
      });

      try {
        aiResult = JSON.parse(openAIResponse.choices?.[0]?.message?.content?.trim() || '{}');
      } catch (err) {
        console.warn('Failed to parse AI response, storing raw text', err);
        aiResult = {
          notes: openAIResponse.choices?.[0]?.message?.content?.trim() ?? '',
        };
      }
    }

    const updatedTone = await prisma.tone.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.artist && { artist: body.artist }),
        ...(body.guitar && { guitar: body.guitar }),
        ...(body.pickups && { pickups: body.pickups }),
        ...(body.strings && { strings: body.strings }),
        ...(body.amp && { amp: body.amp }),
        aiAmpSettings: aiResult.ampSettings,
        aiNotes: aiResult.notes,
      },
    });

    return NextResponse.json(
      { message: 'Successfully updated tone', tone: updatedTone },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Failed to update tone ${id} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to update tone' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const tone = await prisma.tone.findFirst({
      where: { id, userId: user.id },
    });

    if (!tone) return NextResponse.json({ message: 'Tone not found' }, { status: 404 });

    await prisma.tone.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Successfully deleted tone' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete tone ${id} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to delete tone' }, { status: 500 });
  }
}
