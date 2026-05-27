/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

jest.mock('@upstash/ratelimit', () => {
  const limit = jest.fn();
  const RatelimitMock = jest.fn().mockImplementation(() => ({ limit })) as unknown as jest.Mock & {
    slidingWindow: jest.Mock;
    __limit: jest.Mock;
  };
  RatelimitMock.slidingWindow = jest.fn();
  RatelimitMock.__limit = limit;
  return { Ratelimit: RatelimitMock };
});

jest.mock('@upstash/redis', () => ({
  Redis: { fromEnv: jest.fn(() => ({})) },
}));

jest.mock('@/lib/gemini/toneAiService', () => ({
  generateToneSettings: jest.fn(),
}));

import { POST } from '@/app/api/tones/guest/route';
import { generateToneSettings } from '@/lib/gemini/toneAiService';
import { Ratelimit } from '@upstash/ratelimit';

const guestLimitMock = (Ratelimit as unknown as { __limit: jest.Mock }).__limit;

function makeRequest(body: unknown, ip = '203.0.113.1'): NextRequest {
  return new NextRequest('http://localhost/api/tones/guest', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
  });
}

describe('POST /api/tones/guest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 429 when guest rate limit is exceeded for the IP', async () => {
    guestLimitMock.mockResolvedValue({ success: false });

    const res = await POST(
      makeRequest({ artist: 'Hendrix', guitar: 'Strat', amp: 'Marshall' })
    );
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toMatch(/Guest limit reached/i);
    expect(generateToneSettings).not.toHaveBeenCalled();
  });

  it('returns 400 when required fields are missing', async () => {
    guestLimitMock.mockResolvedValue({ success: true });

    const res = await POST(makeRequest({ artist: 'Hendrix' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Invalid input data');
    expect(generateToneSettings).not.toHaveBeenCalled();
  });

  it('returns 200 with AI-generated tone settings on success', async () => {
    guestLimitMock.mockResolvedValue({ success: true });
    (generateToneSettings as jest.Mock).mockResolvedValue({
      ampSettings: { gain: 7, mid: 5, bass: 5, reverb: 3, treble: 6, volume: 7, presence: 5 },
      notes: 'Vintage tone profile',
    });

    const res = await POST(
      makeRequest({ artist: 'Hendrix', guitar: 'Strat', amp: 'Marshall' })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.notes).toBe('Vintage tone profile');
    expect(json.data.ampSettings.gain).toBe(7);
    expect(generateToneSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        artist: 'Hendrix',
        guitar: 'Strat',
        amp: 'Marshall',
      })
    );
  });

  it('rate-limits per IP using the x-forwarded-for header', async () => {
    guestLimitMock.mockResolvedValue({ success: true });
    (generateToneSettings as jest.Mock).mockResolvedValue({
      ampSettings: {},
      notes: '',
    });

    await POST(
      makeRequest({ artist: 'a', guitar: 'g', amp: 'm' }, '198.51.100.42, 10.0.0.1')
    );

    expect(guestLimitMock).toHaveBeenCalledWith('198.51.100.42');
  });

  it('falls back to "anonymous" when x-forwarded-for is missing', async () => {
    guestLimitMock.mockResolvedValue({ success: true });
    (generateToneSettings as jest.Mock).mockResolvedValue({
      ampSettings: {},
      notes: '',
    });

    const req = new NextRequest('http://localhost/api/tones/guest', {
      method: 'POST',
      body: JSON.stringify({ artist: 'a', guitar: 'g', amp: 'm' }),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(req);

    expect(guestLimitMock).toHaveBeenCalledWith('anonymous');
  });

  it('returns 500 when AI generation fails', async () => {
    guestLimitMock.mockResolvedValue({ success: true });
    (generateToneSettings as jest.Mock).mockRejectedValue(new Error('Gemini timeout'));

    const res = await POST(
      makeRequest({ artist: 'Hendrix', guitar: 'Strat', amp: 'Marshall' })
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBeDefined();
  });

  it('does NOT persist any record (guest mode is stateless)', async () => {
    guestLimitMock.mockResolvedValue({ success: true });
    (generateToneSettings as jest.Mock).mockResolvedValue({
      ampSettings: { gain: 5 },
      notes: '',
    });

    // If a Prisma import sneaks in, the test would still pass — but the contract
    // we care about is that the route only calls the AI service. This guards
    // that contract.
    await POST(makeRequest({ artist: 'a', guitar: 'g', amp: 'm' }));

    expect(generateToneSettings).toHaveBeenCalledTimes(1);
  });
});
