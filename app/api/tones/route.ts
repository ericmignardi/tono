import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/lib/openai';
import { revalidatePath } from 'next/cache';

interface ToneCreateBody {
  name?: string;
  artist?: string;
  guitar?: string;
  pickups?: string;
  strings?: string;
  amp?: string;
  pedals?: any;
  settings?: any;
}

interface AIToneResult {
  ampSettings: {
    gain: number;
    treble: number;
    mid: number;
    bass: number;
    volume: number;
  };
  pedalChain: Array<{
    name: string;
    type?: string;
    settings: Record<string, any>;
  }>;
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
    const { name, artist, guitar, pickups, strings, amp, pedals, settings } = body;

    // TODO: Add validation

    const artistSong = artist ?? 'Unknown Artist/Song';
    const guitarMakeModel = guitar ?? 'Unknown Guitar';
    const ampMakeModel = amp ?? 'Unknown Amp';
    const pedalsDescription =
      pedals && Array.isArray(pedals) && pedals.length > 0
        ? pedals.map((p) => p.name || p).join(', ')
        : 'none';

    let aiResult: AIToneResult = {
      ampSettings: { gain: 5, treble: 5, mid: 5, bass: 5, volume: 5 },
      pedalChain: [],
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
            content: `You are a professional guitar tone engineer. Analyze the gear and suggest optimal settings to achieve the desired tone.
                      Output ONLY valid JSON with this exact structure:
                      {
                        "ampSettings": {
                          "gain": number (0-10),
                          "treble": number (0-10),
                          "mid": number (0-10),
                          "bass": number (0-10),
                          "volume": number (0-10)
                        },
                        "pedalChain": [
                          {
                            "name": string,
                            "type": string (e.g., "overdrive", "delay", "reverb", "chorus"),
                            "settings": { "paramName": value }
                          }
                        ],
                        "notes": string (brief technical explanation of the tone and settings)
                      }
                      Base your recommendations on:
                      - The artist's known tone characteristics
                      - The specific gear provided (guitar, pickups, amp)
                      - Proper signal chain order for pedals
                      - Realistic and achievable settings
                      Keep notes concise and technical.`,
          },
          {
            role: 'user',
            content: `Create a tone preset for:
                      Artist/Song: ${artistSong}
                      Guitar: ${guitarMakeModel}
                      Pickups: ${pickups ?? 'stock pickups'}
                      Strings: ${strings ?? 'standard gauge (.010-.046)'}
                      Amp: ${ampMakeModel}
                      Available Pedals: ${pedalsDescription}
                      ${
                        pedals && Array.isArray(pedals) && pedals.length > 0
                          ? `Pedal details: ${JSON.stringify(pedals)}`
                          : 'Suggest a pedal chain if appropriate for this tone.'
                      }
                      Provide specific amp settings and pedal configuration to achieve this tone.`,
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
          pedalChain: parsed.pedalChain || aiResult.pedalChain,
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
        guitar: guitar ?? '',
        pickups: pickups ?? '',
        strings: strings ?? '',
        amp: amp ?? '',
        pedals: aiResult.pedalChain.length > 0 ? aiResult.pedalChain : (pedals ?? []),
        settings:
          Object.keys(aiResult.ampSettings).length > 0 ? aiResult.ampSettings : (settings ?? {}),
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
