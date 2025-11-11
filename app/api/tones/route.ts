import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/lib/openai';
import { revalidatePath } from 'next/cache';

interface ToneCreateBody {
  name?: string;
  artist?: string;
  description?: string;
  guitar?: string;
  pickups?: string;
  strings?: string;
  amp?: string;
}

interface AIToneResult {
  ampSettings: {
    gain: number;
    treble: number;
    mid: number;
    bass: number;
    volume: number;
  };
  notes: string;
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

    // TODO: Add validation

    const toneDescription = description ?? 'Unknown Description';
    const artistSong = artist ?? 'Unknown Artist/Song';
    const guitarMakeModel = guitar ?? 'Unknown Guitar';
    const ampMakeModel = amp ?? 'Unknown Amp';

    let aiResult: AIToneResult = {
      ampSettings: { gain: 5, treble: 5, mid: 5, bass: 5, volume: 5 },
      notes: 'Default settings applied',
    };

    try {
      const openAIResponse = await client.chat.completions.create({
        model: 'gpt-4-turbo',
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
                      Pickups: ${pickups ?? 'stock pickups'}
                      Strings: ${strings ?? 'standard gauge (.010-.046)'}
                      Amp: ${ampMakeModel}

                      INSTRUCTIONS:
                      - Provide EXACT numeric settings for every amp knob
                      - Account for how THIS specific guitar and pickup combination will interact with the amp
                      - If the available gear can't achieve the exact tone, get as close as possible and explain the compromise in notes`,
          },
        ],
      });

      const aiContent = openAIResponse.choices?.[0]?.message?.content?.trim();

      if (!aiContent) {
        console.error('Empty response from OpenAI');
        throw new Error('Empty AI response');
      }

      try {
        const parsed = JSON.parse(aiContent);
        aiResult = {
          ampSettings: parsed.ampSettings || aiResult.ampSettings,
          notes: parsed.notes || aiResult.notes,
        };
      } catch (parseErr) {
        console.warn('Failed to parse AI response as JSON:', parseErr);
        console.warn('AI Response:', aiContent);
        aiResult.notes = aiContent || 'Unable to parse AI recommendations';
      }
    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      aiResult.notes = 'AI tone generation unavailable, using default settings';
    }

    const tone = await prisma.tone.create({
      data: {
        userId: dbUser.id,
        name: name ?? `${artistSong} Tone`,
        artist: artist ?? '',
        description: description ?? '',
        guitar: guitar ?? '',
        pickups: pickups ?? '',
        strings: strings ?? '',
        amp: amp ?? '',
        aiAmpSettings: aiResult.ampSettings ?? {},
        aiNotes: aiResult.notes ?? '',
      },
    });

    revalidatePath('/dashboard/tones');

    return NextResponse.json({ message: 'Successfully created tone', tone }, { status: 201 });
  } catch (error) {
    console.error(`Failed to create tone for user ${user?.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to create tone',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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
    console.error(`Failed to fetch tones for user ${user?.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to fetch tones',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
