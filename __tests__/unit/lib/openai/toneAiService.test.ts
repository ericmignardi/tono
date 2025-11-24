import { generateToneSettings, ToneGearConfig } from '@/lib/openai/toneAiService';
import { client } from '@/lib/openai/openai';
import { getCachedTone, setCachedTone } from '@/lib/openai/toneCache';
import { DEFAULT_AMP_SETTINGS } from '@/lib/openai/toneAiService';

jest.mock('@/lib/openai/openai', () => ({
  client: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

jest.mock('@/lib/openai/toneCache', () => ({
  getCachedTone: jest.fn(),
  setCachedTone: jest.fn(),
  invalidateCachedTone: jest.fn(),
}));

describe('generateToneSettings', () => {
  const mockConfig: ToneGearConfig = {
    artist: 'Test Artist',
    description: 'Test Description',
    guitar: 'Test Guitar',
    pickups: 'Test Pickups',
    strings: 'Test Strings',
    amp: 'Test Amp',
  };

  const mockAiResponse = {
    ampSettings: {
      gain: 5,
      treble: 5,
      mid: 5,
      bass: 5,
      volume: 5,
      presence: 5,
      reverb: 5,
    },
    notes: 'Test notes',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached result if available', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(mockAiResponse);

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual(mockAiResponse);
    expect(getCachedTone).toHaveBeenCalledWith(mockConfig);
    expect(client.chat.completions.create).not.toHaveBeenCalled();
  });

  it('should call OpenAI and cache result on cache miss', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(null);
    (client.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockAiResponse),
          },
        },
      ],
    });

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual(mockAiResponse);
    expect(setCachedTone).toHaveBeenCalledWith(mockConfig, mockAiResponse);
  });

  it('should handle OpenAI API errors gracefully', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(null);
    (client.chat.completions.create as jest.Mock).mockRejectedValue(new Error('API error'));

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual({
      ampSettings: DEFAULT_AMP_SETTINGS,
      notes: 'AI tone generation unavailable, using default settings',
    });
  });

  it('should handle invalid JSON from OpenAI', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(null);
    (client.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Not JSON',
          },
        },
      ],
    });

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual({
      ampSettings: DEFAULT_AMP_SETTINGS,
      notes: 'Not JSON',
    });
  });
});
