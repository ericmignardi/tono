import { client } from '@/lib/openai/openai';
import { getCachedTone, setCachedTone, invalidateCachedTone } from '@/lib/openai/toneCache';

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

const SYSTEM_PROMPT = `You are a guitar tone engineer. Provide SPECIFIC amp settings for the given gear.

Output ONLY valid JSON:
{
  "ampSettings": {
    "gain": number (0-10, 0.5 increments),
    "treble": number (0-10, 0.5 increments),
    "mid": number (0-10, 0.5 increments),
    "bass": number (0-10, 0.5 increments),
    "volume": number (0-10, 0.5 increments),
    "presence": number (0-10, 0.5 increments),
    "reverb": number (0-10, 0.5 increments)
  },
  "notes": string (2-3 sentences on WHY these settings work)
}

REQUIREMENTS:
1. Analyze full gear: guitar, pickups (single-coil vs humbucker), strings, amp type
2. Match tone description: bright/dark, compressed/dynamic, clean/overdriven
3. Adjust for amp characteristics (British/American, tube/solid-state)
4. Humbuckers need less gain; single-coils may need mid boost
5. Base on artist's documented settings when possible, adapt to provided gear

Keep notes concise and technical.`;

function buildUserPrompt(config: ToneGearConfig): string {
  return `TARGET TONE:
Artist/Reference: ${config.artist}
Description: ${config.description}

GEAR:
Guitar: ${config.guitar}
Pickups: ${config.pickups}
Strings: ${config.strings}
Amp: ${config.amp}

Provide exact settings for this gear. If gear can't achieve exact tone, get close and note compromise.`;
}

/**
 * Generates AI-powered amp settings and recommendations for a guitar tone
 * Checks cache first to avoid unnecessary API calls
 * @param config - The gear configuration and tone description
 * @param bypassCache - If true, skip cache and force new generation
 * @returns AI-generated amp settings and explanatory notes
 */
export async function generateToneSettings(
  config: ToneGearConfig,
  bypassCache = false
): Promise<AIToneResult> {
  const defaultResult: AIToneResult = {
    ampSettings: DEFAULT_AMP_SETTINGS,
    notes: 'Default settings applied',
  };

  // Check cache first (unless bypassed)
  if (!bypassCache) {
    const cachedResult = await getCachedTone(config);
    if (cachedResult) {
      return cachedResult;
    }
  }

  // Cache miss or bypassed - call OpenAI
  try {
    const openAIResponse = await client.chat.completions.create({
      model: 'gpt-4o-mini',
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

      const result: AIToneResult = {
        ampSettings: parsed.ampSettings || defaultResult.ampSettings,
        notes: parsed.notes || defaultResult.notes,
      };

      // Store in cache for future requests
      await setCachedTone(config, result);

      return result;
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
 * Invalidates cache to ensure fresh generation
 * @param config - The gear configuration and tone description
 * @param fallbackSettings - Existing settings to use if generation fails
 * @returns AI-generated settings or fallback settings
 */
export async function regenerateToneSettings(
  config: ToneGearConfig,
  fallbackSettings: AIToneResult
): Promise<AIToneResult> {
  try {
    // Invalidate cache to force fresh generation
    await invalidateCachedTone(config);

    // Generate new settings (bypass cache)
    return await generateToneSettings(config, true);
  } catch (error) {
    console.error('Failed to regenerate tone settings, using fallback:', error);
    return fallbackSettings;
  }
}
