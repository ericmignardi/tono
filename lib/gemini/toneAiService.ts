import { getModel, retryGeminiRequest } from '@/lib/gemini/gemini';
import { getCachedTone, setCachedTone, invalidateCachedTone } from '@/lib/gemini/toneCache';

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

export const DEFAULT_AMP_SETTINGS: AmpSettings = {
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

export async function generateToneSettings(
  config: ToneGearConfig,
  bypassCache = false
): Promise<AIToneResult> {
  const defaultResult: AIToneResult = {
    ampSettings: DEFAULT_AMP_SETTINGS,
    notes: 'Default settings applied',
  };

  if (!bypassCache) {
    const cachedResult = await getCachedTone(config);
    if (cachedResult) {
      return cachedResult;
    }
  }

  try {
    const model = getModel('gemini-2.5-flash');

    const result = await retryGeminiRequest(() =>
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }, { text: '\n\n' }, { text: buildUserPrompt(config) }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      })
    );

    const response = result.response;
    const aiResponse = response.text()?.trim();

    if (!aiResponse) {
      console.error('Empty response from Gemini');
      throw new Error('Empty AI response');
    }

    try {
      const parsed = JSON.parse(aiResponse);

      const toneResult: AIToneResult = {
        ampSettings: parsed.ampSettings || defaultResult.ampSettings,
        notes: parsed.notes || defaultResult.notes,
      };

      await setCachedTone(config, toneResult);

      return toneResult;
    } catch (parseErr) {
      console.warn('Failed to parse AI response as JSON:', parseErr);
      console.warn('AI Response:', aiResponse);

      return {
        ampSettings: defaultResult.ampSettings,
        notes: aiResponse || 'Unable to parse AI recommendations',
      };
    }
  } catch (aiError) {
    console.error('Gemini API error:', aiError);

    return {
      ampSettings: defaultResult.ampSettings,
      notes: 'AI tone generation unavailable, using default settings',
    };
  }
}

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

export async function generateEnhancedToneSettings(
  config: ToneGearConfig,
  audioAnalysis?: {
    brightness: string;
    distortion: string;
    frequency: { bass: string; mids: string; treble: string };
    effects: string[];
    dynamics: string;
    description: string;
    genre: string;
    energy: string;
  }
): Promise<AIToneResult> {
  const defaultResult: AIToneResult = {
    ampSettings: DEFAULT_AMP_SETTINGS,
    notes: 'Default settings applied',
  };

  try {
    const model = getModel('gemini-2.5-flash');

    // Build enhanced prompts that incorporate audio analysis
    const systemPrompt = buildEnhancedSystemPrompt(audioAnalysis);
    const userPrompt = buildEnhancedUserPrompt(config, audioAnalysis);

    const result = await retryGeminiRequest(() =>
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }, { text: '\n\n' }, { text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      })
    );

    const response = result.response;
    const aiResponse = response.text()?.trim();

    if (!aiResponse) {
      console.error('Empty response from Gemini');
      throw new Error('Empty AI response');
    }

    const parsed = JSON.parse(aiResponse);

    return {
      ampSettings: parsed.ampSettings || defaultResult.ampSettings,
      notes: parsed.notes || defaultResult.notes,
    };
  } catch (error) {
    console.error('Enhanced tone generation error:', error);
    return {
      ampSettings: defaultResult.ampSettings,
      notes: 'AI tone generation unavailable, using default settings',
    };
  }
}

function buildEnhancedSystemPrompt(audioAnalysis?: {
  brightness: string;
  distortion: string;
  frequency: { bass: string; mids: string; treble: string };
  effects: string[];
  dynamics: string;
  description: string;
}): string {
  const basePrompt = `You are a guitar tone engineer. Provide SPECIFIC amp settings for the given gear.`;

  if (!audioAnalysis) {
    return SYSTEM_PROMPT;
  }

  return `${basePrompt}

You have been provided with AUDIO ANALYSIS of the target tone. Use this to make HIGHLY ACCURATE recommendations.

Audio Analysis Results:
- Brightness: ${audioAnalysis.brightness}
- Distortion Level: ${audioAnalysis.distortion}
- Frequency Balance: Bass=${audioAnalysis.frequency.bass}, Mids=${audioAnalysis.frequency.mids}, Treble=${audioAnalysis.frequency.treble}
- Effects Detected: ${audioAnalysis.effects.join(', ')}
- Dynamics: ${audioAnalysis.dynamics}
- Description: ${audioAnalysis.description}

Output ONLY valid JSON:
{
  "ampSettings": {
    "gain": number (0-10, 0.5 increments) - Match the detected distortion level,
    "treble": number (0-10, 0.5 increments) - Match the brightness and treble frequency,
    "mid": number (0-10, 0.5 increments) - Match the mid frequency balance,
    "bass": number (0-10, 0.5 increments) - Match the bass frequency,
    "volume": number (0-10, 0.5 increments),
    "presence": number (0-10, 0.5 increments) - Adjust for brightness,
    "reverb": number (0-10, 0.5 increments) - Match detected reverb
  },
  "notes": string (Explain how settings match the audio analysis)
}`;
}

function buildEnhancedUserPrompt(
  config: ToneGearConfig,
  audioAnalysis?: {
    brightness: string;
    distortion: string;
    genre: string;
    energy: string;
  }
): string {
  let prompt = `TARGET TONE:
Artist/Reference: ${config.artist}
Description: ${config.description}

GEAR:
Guitar: ${config.guitar}
Pickups: ${config.pickups}
Strings: ${config.strings}
Amp: ${config.amp}`;

  if (audioAnalysis) {
    prompt += `\n\nAUDIO ANALYSIS CONFIRMS:
- The target tone is ${audioAnalysis.brightness} with ${audioAnalysis.distortion} distortion
- Genre/Style: ${audioAnalysis.genre}
- Energy Level: ${audioAnalysis.energy}

Provide exact settings that will recreate this analyzed tone using the specified gear.`;
  } else {
    prompt += `\n\nProvide exact settings for this gear. If gear can't achieve exact tone, get close and note compromise.`;
  }

  return prompt;
}
