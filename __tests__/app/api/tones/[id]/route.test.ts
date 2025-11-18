/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/tones/[id]/route';

jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
}));

jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    tone: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/rateLimit', () => ({
  toneRateLimit: {
    limit: jest.fn(),
  },
  apiRateLimit: {
    limit: jest.fn(),
  },
}));

jest.mock('@/lib/openai/toneAiService', () => ({
  regenerateToneSettings: jest.fn().mockResolvedValue({
    ampSettings: { gain: 7 },
    notes: 'AI regenerated notes',
  }),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { prisma } from '@/lib/prisma/database';
import { currentUser } from '@clerk/nextjs/server';
import { toneRateLimit, apiRateLimit } from '@/lib/rateLimit';
import { regenerateToneSettings } from '@/lib/openai/toneAiService';

describe('/api/tones/[id]', () => {
  const validId = 'cuidvalidid12345678901234';
  const invalidId = 'invalid-id';
  const mockUser = { id: 'clerk_user_123', email: 'test@example.com' };
  const mockDbUser = { id: 'db_user_1' };
  const mockTone = {
    id: validId,
    name: 'My Tone',
    artist: 'Artist',
    description: 'Desc',
    guitar: 'Strat',
    pickups: 'Single Coil',
    strings: '10s',
    amp: 'Marshall',
    aiAmpSettings: { gain: 5, mid: 5, bass: 5, reverb: 5, treble: 5, volume: 5, presence: 5 },
    aiNotes: 'original notes',
    userId: 'db_user_1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tones/[id]', () => {
    const context = { params: Promise.resolve({ id: validId }) };

    it('should return 200 with tone', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(mockTone);

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'GET' });

      const res = await GET(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tone).toEqual(mockTone);
    });

    it('should return 401 when unauthorized', async () => {
      (currentUser as jest.Mock).mockResolvedValue(null);
      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'GET' });
      const res = await GET(req, context);
      const json = await res.json();
      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 429 when rate limited', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'GET' });
      const res = await GET(req, context);
      const json = await res.json();
      expect(res.status).toBe(429);
      expect(json.error).toBe('Too many requests. Please slow down.');
    });

    it('should return 404 when user not found', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'GET' });
      const res = await GET(req, context);
      const json = await res.json();
      expect(res.status).toBe(404);
      expect(json.error).toBe('User not found');
    });

    it('should return 404 when tone not found', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'GET' });
      const res = await GET(req, context);
      const json = await res.json();
      expect(res.status).toBe(404);
      expect(json.error).toBe('Tone not found');
    });

    it('should return 400 for invalid id', async () => {
      const invalidContext = { params: Promise.resolve({ id: invalidId }) };
      const req = new NextRequest(`http://localhost/api/tones/${invalidId}`, { method: 'GET' });
      const res = await GET(req, invalidContext);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid tone ID format');
    });
  });

  describe('PUT /api/tones/[id]', () => {
    const context = { params: Promise.resolve({ id: validId }) };
    const validUpdateBody = { name: 'Updated Tone', artist: 'New Artist' };

    it('should update tone and regenerate AI if gear changed', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(mockTone);
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn) =>
        fn({
          user: {
            findUnique: jest.fn().mockResolvedValue({
              generationsUsed: 0,
              generationsLimit: 10,
            }),
            update: jest.fn().mockResolvedValue({}),
          },
        })
      );
      (prisma.tone.update as jest.Mock).mockResolvedValue({ ...mockTone, ...validUpdateBody });

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, {
        method: 'PUT',
        body: JSON.stringify(validUpdateBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tone.name).toBe(validUpdateBody.name);
      expect(regenerateToneSettings).toHaveBeenCalled();
    });

    it('should update tone without regenerating AI if only name changed', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(mockTone);
      (prisma.tone.update as jest.Mock).mockResolvedValue({
        ...mockTone,
        name: 'Just Name Change',
      });

      const nameOnlyBody = { name: 'Just Name Change' };

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, {
        method: 'PUT',
        body: JSON.stringify(nameOnlyBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tone.name).toBe('Just Name Change');
      expect(regenerateToneSettings).not.toHaveBeenCalled();
      expect(toneRateLimit.limit).not.toHaveBeenCalled();
    });

    it('should return 429 when rate limit exceeded on gear change', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(mockTone);
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, {
        method: 'PUT',
        body: JSON.stringify(validUpdateBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.error).toBe('Too many tone generation requests. Please slow down.');
      expect(regenerateToneSettings).not.toHaveBeenCalled();
    });

    it('should return 403 when credits exhausted on gear change', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(mockTone);
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn) =>
        fn({
          user: {
            findUnique: jest.fn().mockResolvedValue({
              generationsUsed: 10,
              generationsLimit: 10,
            }),
            update: jest.fn(),
          },
        })
      );

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, {
        method: 'PUT',
        body: JSON.stringify(validUpdateBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe('No remaining credits. Please upgrade your plan.');
      expect(regenerateToneSettings).not.toHaveBeenCalled();
    });

    it('should return 401 when unauthorized', async () => {
      (currentUser as jest.Mock).mockResolvedValue(null);
      const req = new NextRequest(`http://localhost/api/tones/${validId}`, {
        method: 'PUT',
        body: JSON.stringify(validUpdateBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await PUT(req, context);
      const json = await res.json();
      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid ID', async () => {
      const invalidContext = { params: Promise.resolve({ id: invalidId }) };
      const req = new NextRequest(`http://localhost/api/tones/${invalidId}`, {
        method: 'PUT',
        body: JSON.stringify(validUpdateBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await PUT(req, invalidContext);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid tone ID format');
    });

    it('should return 404 if user not found', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, {
        method: 'PUT',
        body: JSON.stringify(validUpdateBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();
      expect(res.status).toBe(404);
      expect(json.error).toBe('User not found');
    });

    it('should return 404 if tone not found', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, {
        method: 'PUT',
        body: JSON.stringify(validUpdateBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();
      expect(res.status).toBe(404);
      expect(json.error).toBe('Tone not found');
    });

    it('should return 400 for invalid body', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      const invalidBody = { ...validUpdateBody, artist: null };

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, {
        method: 'PUT',
        body: JSON.stringify(invalidBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid input data');
    });
  });

  describe('DELETE /api/tones/[id]', () => {
    const context = { params: Promise.resolve({ id: validId }) };

    it('should delete tone successfully', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(mockTone);
      (prisma.tone.delete as jest.Mock).mockResolvedValue({});

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'DELETE' });
      const res = await DELETE(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.message).toBe('Successfully deleted tone');
    });

    it('should return 401 when unauthorized', async () => {
      (currentUser as jest.Mock).mockResolvedValue(null);
      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'DELETE' });
      const res = await DELETE(req, context);
      const json = await res.json();
      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 429 when rate limited', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'DELETE' });
      const res = await DELETE(req, context);
      const json = await res.json();
      expect(res.status).toBe(429);
      expect(json.error).toBe('Too many requests. Please slow down.');
    });

    it('should return 404 when user not found', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'DELETE' });
      const res = await DELETE(req, context);
      const json = await res.json();
      expect(res.status).toBe(404);
      expect(json.error).toBe('User not found');
    });

    it('should return 404 when tone not found', async () => {
      (currentUser as jest.Mock).mockResolvedValue(mockUser);
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      (prisma.tone.findFirst as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost/api/tones/${validId}`, { method: 'DELETE' });
      const res = await DELETE(req, context);
      const json = await res.json();
      expect(res.status).toBe(404);
      expect(json.error).toBe('Tone not found');
    });

    it('should return 400 for invalid id', async () => {
      const invalidContext = { params: Promise.resolve({ id: invalidId }) };
      const req = new NextRequest(`http://localhost/api/tones/${invalidId}`, { method: 'DELETE' });
      const res = await DELETE(req, invalidContext);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid tone ID format');
    });
  });
});
