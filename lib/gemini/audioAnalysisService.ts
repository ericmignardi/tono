import { getModel, retryGeminiRequest } from './gemini';

export interface AudioToneCharacteristics {
  genre: string;
  tempo: string;
  energy: string;
  brightness: string; // bright, dark, balanced
  distortion: string; // clean, light, moderate, heavy
  dynamics: string; // compressed, dynamic
  frequency: {
    bass: string; // low, balanced, high
    mids: string;
    treble: string;
  };
  effects: string[];
  description: string;
}

/**
 * Analyzes an audio file to extract guitar tone characteristics using Gemini API
 * @param audioBuffer - The audio file buffer
 * @param mimeType - The MIME type of the audio file
 * @returns Detailed tone characteristics from the audio
 */
export async function analyzeAudioTone(
  audioBuffer: Buffer,
  mimeType: string
): Promise<AudioToneCharacteristics> {
  try {
    const model = getModel('gemini-2.5-flash');

    const prompt = `Analyze this guitar audio clip and extract detailed tone characteristics.

Focus on:
1. Overall tone quality (bright, dark, warm, cold)
2. Distortion/gain level (clean, light crunch, moderate distortion, heavy distortion)
3. Frequency balance (bass, mids, treble - each rated as low/balanced/high)
4. Effects detected (reverb, delay, chorus, etc.)
5. Dynamic range (compressed or dynamic)
6. Energy level (low, medium, high)
7. Genre/style indicators

Return a JSON object with this structure:
{
  "genre": "string (e.g., rock, metal, blues, jazz)",
  "tempo": "string (slow, medium, fast)",
  "energy": "string (low, medium, high)",
  "brightness": "string (dark, balanced, bright)",
  "distortion": "string (clean, light, moderate, heavy)",
  "dynamics": "string (compressed, dynamic)",
  "frequency": {
    "bass": "string (low, balanced, high)",
    "mids": "string (low, balanced, high)",
    "treble": "string (low, balanced, high)"
  },
  "effects": ["array of detected effects"],
  "description": "string (2-3 sentences describing the overall tone)"
}`;

    const result = await retryGeminiRequest(() =>
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: audioBuffer.toString('base64'),
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      })
    );

    const response = result.response.text();
    const analysis: AudioToneCharacteristics = JSON.parse(response);

    return analysis;
  } catch (error) {
    console.error('Gemini audio analysis error:', error);
    throw new Error('Failed to analyze audio');
  }
}

/**
 * Validates audio file format and size
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB
  const SUPPORTED_FORMATS = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/aiff',
    'audio/aac',
    'audio/ogg',
    'audio/flac',
  ];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Audio file must be less than 20MB' };
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format. Supported: WAV, MP3, AIFF, AAC, OGG, FLAC`,
    };
  }

  return { valid: true };
}
