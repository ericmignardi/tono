import { client } from '@/lib/openai/openai';

export interface AmpSettings {
  mid: number;
  bass: number;
  gain: number;
  reverb: number;
  treble: number;
  volume: number;
  presence: number;
  [key: string]: number; // Index signature for Prisma compatibility
}

export interface AIToneResult {
  ampSettings: AmpSettings;
  notes: string;
}

export interface ToneGearConfig {
  artist: string;
  description: string;
  guitar: string;
  pickups: string;
  strings: string;
  amp: string;
}

const DEFAULT_AMP_SETTINGS: AmpSettings = {
  mid: 5,
  bass: 5,
  gain: 5,
  reverb: 5,
  treble: 5,
  volume: 5,
  presence: 5,
};

const SYSTEM_PROMPT = `You are a professional guitar tone engineer with deep knowledge of classic and modern guitar tones. Your job is to provide SPECIFIC, ACTIONABLE settings that can be directly applied to the equipment.
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

Keep notes technical but concise - explain the key tonal decisions made.`;

function buildUserPrompt(config: ToneGearConfig): string {
  return `Create a tone preset to match this sonic goal:

TARGET TONE:
Artist/Song Reference: ${config.artist}
Tone Description: ${config.description}

AVAILABLE GEAR:
Guitar: ${config.guitar}
Pickups: ${config.pickups}
Strings: ${config.strings}
Amp: ${config.amp}

INSTRUCTIONS:
- Provide EXACT numeric settings for every amp knob
- Account for how THIS specific guitar and pickup combination will interact with the amp
- If the available gear can't achieve the exact tone, get as close as possible and explain the compromise in notes`;
}

/**
 * Generates AI-powered amp settings and recommendations for a guitar tone
 * @param config - The gear configuration and tone description
 * @returns AI-generated amp settings and explanatory notes
 */
export async function generateToneSettings(config: ToneGearConfig): Promise<AIToneResult> {
  const defaultResult: AIToneResult = {
    ampSettings: DEFAULT_AMP_SETTINGS,
    notes: 'Default settings applied',
  };

  try {
    const openAIResponse = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildUserPrompt(config),
        },
      ],
    });

    const aiResponse = openAIResponse.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      console.error('Empty response from OpenAI');
      throw new Error('Empty AI response');
    }

    try {
      const parsed = JSON.parse(aiResponse);

      return {
        ampSettings: parsed.ampSettings || defaultResult.ampSettings,
        notes: parsed.notes || defaultResult.notes,
      };
    } catch (parseErr) {
      console.warn('Failed to parse AI response as JSON:', parseErr);
      console.warn('AI Response:', aiResponse);

      return {
        ampSettings: defaultResult.ampSettings,
        notes: aiResponse || 'Unable to parse AI recommendations',
      };
    }
  } catch (aiError) {
    console.error('OpenAI API error:', aiError);

    return {
      ampSettings: defaultResult.ampSettings,
      notes: 'AI tone generation unavailable, using default settings',
    };
  }
}

/**
 * Safely attempts to generate tone settings, falling back to existing settings on failure
 * @param config - The gear configuration and tone description
 * @param fallbackSettings - Existing settings to use if generation fails
 * @returns AI-generated settings or fallback settings
 */
export async function regenerateToneSettings(
  config: ToneGearConfig,
  fallbackSettings: AIToneResult
): Promise<AIToneResult> {
  try {
    return await generateToneSettings(config);
  } catch (error) {
    console.error('Failed to regenerate tone settings, using fallback:', error);
    return fallbackSettings;
  }
}
