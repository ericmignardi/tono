import { generateToneSettings, ToneGearConfig } from '@/lib/gemini/toneAiService';
import { getModel } from '@/lib/gemini/gemini';
import { getCachedTone, setCachedTone } from '@/lib/gemini/toneCache';
import { DEFAULT_AMP_SETTINGS } from '@/lib/gemini/toneAiService';

jest.mock('@/lib/gemini/gemini', () => ({
  getModel: jest.fn(),
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

  const mockGenerateContent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getModel as jest.Mock).mockReturnValue({
      generateContent: mockGenerateContent,
    });
  });

  it('should return cached result if available', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(mockAiResponse);

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual(mockAiResponse);
    expect(getCachedTone).toHaveBeenCalledWith(mockConfig);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should call Gemini API and cache result on cache miss', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(null);
    mockGenerateContent.mockResolvedValue({
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
    mockGenerateContent.mockRejectedValue(new Error('API error'));

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual({
      ampSettings: DEFAULT_AMP_SETTINGS,
      notes: 'AI tone generation unavailable, using default settings',
    });
  });

  it('should handle invalid JSON from Gemini', async () => {
    (getCachedTone as jest.Mock).mockResolvedValue(null);
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'Not JSON',
      },
    });

    const result = await generateToneSettings(mockConfig);
    expect(result).toEqual({
      ampSettings: DEFAULT_AMP_SETTINGS,
      notes: 'Not JSON',
    });
  });
});
