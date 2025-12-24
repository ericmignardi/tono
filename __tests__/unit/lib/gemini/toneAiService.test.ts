import { generateToneSettings, ToneGearConfig } from '@/lib/gemini/toneAiService';
import { getModel, retryGeminiRequest } from '@/lib/gemini/gemini';
import { getCachedTone, setCachedTone } from '@/lib/gemini/toneCache';
import { DEFAULT_AMP_SETTINGS } from '@/lib/gemini/toneAiService';

jest.mock('@/lib/gemini/gemini', () => ({
  getModel: jest.fn(),
  retryGeminiRequest: jest.fn(),
}));

jest.mock('@/lib/gemini/toneCache', () => ({
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
    // Mock getModel to return a model object (even though retryGeminiRequest is mocked)
    (getModel as jest.Mock).mockReturnValue({
      generateContent: jest.fn(),
    });
  });

  it('should return cached result if available', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(mockAiResponse);

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual(mockAiResponse);
    expect(getCachedTone).toHaveBeenCalledWith(mockConfig);
    expect(retryGeminiRequest).not.toHaveBeenCalled();
  });

  it('should call Gemini API and cache result on cache miss', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(null);
    (retryGeminiRequest as jest.Mock).mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockAiResponse),
      },
    });

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual(mockAiResponse);
    expect(setCachedTone).toHaveBeenCalledWith(mockConfig, mockAiResponse);
  });

  it('should handle Gemini API errors gracefully', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(null);
    (retryGeminiRequest as jest.Mock).mockRejectedValue(new Error('API error'));

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual({
      ampSettings: DEFAULT_AMP_SETTINGS,
      notes: 'AI tone generation unavailable, using default settings',
    });
  });

  it('should handle invalid JSON from Gemini', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(null);
    (retryGeminiRequest as jest.Mock).mockResolvedValue({
      response: {
        text: () => 'Not JSON',
      },
    });

    const result = await generateToneSettings(mockConfig);
    // When JSON parsing fails, the service falls back to using the raw text as notes
    expect(result).toEqual({
      ampSettings: DEFAULT_AMP_SETTINGS,
      notes: 'Not JSON',
    });
  });
});
