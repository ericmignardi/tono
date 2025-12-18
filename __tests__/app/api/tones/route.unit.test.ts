/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/tones/route';

jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
}));

jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tone: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
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

jest.mock('@/lib/gemini/toneAiService', () => ({
  generateToneSettings: jest.fn().mockResolvedValue({
    ampSettings: { gain: 7, mid: 5, bass: 5, reverb: 5, treble: 5, volume: 5, presence: 5 },
    notes: 'AI generated notes',
  }),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import { toneRateLimit, apiRateLimit } from '@/lib/rateLimit';
import { generateToneSettings } from '@/lib/gemini/toneAiService';

describe('/api/tones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tones', () => {
    const validBody = {
      name: 'My Tone',
      artist: 'Artist',
      description: 'Some description',
      guitar: 'Strat',
      pickups: 'Single Coil',
      strings: '10s',
      amp: 'Marshall',
    };

    it('should return 201 with valid input', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_user_1',
        clerkId: 'clerk_user_123',
      });
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
      (prisma.tone.create as jest.Mock).mockResolvedValue({ id: 'tone_1', name: 'My Tone' });

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.message).toBe('Successfully created tone');
      expect(generateToneSettings).toHaveBeenCalled();
      expect(prisma.tone.create).toHaveBeenCalled();
    });

    it('should return 401 when unauthorized', async () => {
      (currentUser as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
      expect(generateToneSettings).not.toHaveBeenCalled();
      expect(prisma.tone.create).not.toHaveBeenCalled();
    });

    it('should return 429 when rate limit exceeded', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.error).toBe('Too many tone generation requests. Please slow down.');
      expect(generateToneSettings).not.toHaveBeenCalled();
      expect(prisma.tone.create).not.toHaveBeenCalled();
    });

    it('should return 404 when database user not found', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('User not found');
      expect(generateToneSettings).not.toHaveBeenCalled();
      expect(prisma.tone.create).not.toHaveBeenCalled();
    });

    it('should return 400 when invalid input', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_user_1',
        clerkId: 'clerk_user_123',
      });

      const invalidBody = { ...validBody, guitar: null };

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(invalidBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid input data');
      expect(generateToneSettings).not.toHaveBeenCalled();
      expect(prisma.tone.create).not.toHaveBeenCalled();
    });

    it('should return 403 when credits exhausted', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_user_1',
        clerkId: 'clerk_user_123',
      });
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

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe('No remaining credits. Please upgrade your plan.');
      expect(generateToneSettings).not.toHaveBeenCalled();
      expect(prisma.tone.create).not.toHaveBeenCalled();
    });

    it('should return 500 when AI generation fails', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_user_1',
        clerkId: 'clerk_user_123',
      });
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
      (generateToneSettings as jest.Mock).mockRejectedValueOnce(new Error('Gemini API timeout'));

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBeDefined();
      expect(prisma.tone.create).not.toHaveBeenCalled();
    });

    it('should return 500 when tone creation fails', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_user_1',
        clerkId: 'clerk_user_123',
      });
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
      (prisma.tone.create as jest.Mock).mockRejectedValueOnce(
        new Error('Database constraint violation')
      );

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBeDefined();
    });

    it('should return 400 when body is not valid JSON', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500); // JSON parse error caught by handleAPIError
      expect(json.error).toBeDefined();
    });

    it('should successfully create tone with all fields', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'db_user_1',
        clerkId: 'clerk_user_123',
      });
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
      (prisma.tone.create as jest.Mock).mockResolvedValue({
        id: 'tone_1',
        name: 'Complete Tone',
        artist: 'Artist',
        description: 'Test description',
        guitar: 'Strat',
        pickups: 'Single Coil',
        strings: '10s',
        amp: 'Marshall',
      });

      const completeBody = {
        name: 'Complete Tone',
        artist: 'Artist',
        description: 'Test description',
        guitar: 'Strat',
        pickups: 'Single Coil',
        strings: '10s',
        amp: 'Marshall',
      };

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(completeBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.message).toBe('Successfully created tone');
      expect(json.tone).toMatchObject({
        name: 'Complete Tone',
        artist: 'Artist',
        guitar: 'Strat',
      });
      expect(generateToneSettings).toHaveBeenCalled();
      expect(prisma.tone.create).toHaveBeenCalled();
    });
  });

  describe('GET /api/tones', () => {
    const baseUrl = 'http://localhost/api/tones?page=1&limit=10';

    it('should return 200 with tones and pagination', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'db_user_1' });
      (prisma.tone.findMany as jest.Mock).mockResolvedValue([{ id: 'tone_1', name: 'My Tone' }]);
      (prisma.tone.count as jest.Mock).mockResolvedValue(1);

      const req = new NextRequest(baseUrl, { method: 'GET' });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.message).toBe('Successfully fetched tones');
      expect(json.tones.length).toBe(1);
      expect(json.pagination.page).toBe(1);
      expect(json.pagination.limit).toBe(10);
    });

    it('should return 401 when unauthorized', async () => {
      (currentUser as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(baseUrl, { method: 'GET' });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 429 when rate limit exceeded', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

      const req = new NextRequest(baseUrl, { method: 'GET' });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.error).toBe('Too many requests. Please slow down.');
    });

    it('should return 404 when user not found', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(baseUrl, { method: 'GET' });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('User not found');
    });

    it('should return 400 when invalid query params', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'db_user_1' });

      const req = new NextRequest('http://localhost/api/tones?page=abc&limit=xyz', {
        method: 'GET',
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid query parameters');
    });

    it('should return empty array when user has no tones', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'db_user_1' });
      (prisma.tone.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.tone.count as jest.Mock).mockResolvedValue(0);

      const req = new NextRequest(baseUrl, { method: 'GET' });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tones).toEqual([]);
      expect(json.pagination.total).toBe(0);
      expect(json.pagination.totalPages).toBe(0);
    });

    it('should work with explicit page and limit params', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'db_user_1' });
      (prisma.tone.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.tone.count as jest.Mock).mockResolvedValue(0);

      // Explicit query params
      const req = new NextRequest('http://localhost/api/tones?page=1&limit=10', {
        method: 'GET',
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.pagination.page).toBe(1);
      expect(json.pagination.limit).toBe(10);
    });

    it('should calculate pagination correctly for multiple pages', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'db_user_1' });
      (prisma.tone.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.tone.count as jest.Mock).mockResolvedValue(35);

      const req = new NextRequest('http://localhost/api/tones?page=2&limit=10', {
        method: 'GET',
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.pagination.total).toBe(35);
      expect(json.pagination.totalPages).toBe(4);
      expect(json.pagination.hasNextPage).toBe(true);
      expect(json.pagination.hasPrevPage).toBe(true);
    });

    it('should handle database query failure', async () => {
      (currentUser as jest.Mock).mockResolvedValue({
        id: 'clerk_user_123',
        email: 'test@example.com',
      });
      (apiRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'db_user_1' });
      (prisma.tone.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('Database connection lost')
      );

      const req = new NextRequest(baseUrl, { method: 'GET' });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBeDefined();
    });
  });
});
