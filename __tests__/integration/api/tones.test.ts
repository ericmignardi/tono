/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { cleanDatabase, createTestUser, createTestTone } from '../../../test-helpers/testDb';
import { currentUser } from '@clerk/nextjs/server';
import { generateToneSettings } from '@/lib/openai/toneAiService';
import { prisma } from '@/lib/prisma/database';
import { toneRateLimit } from '@/lib/rateLimit';
import { GET, POST } from '@/app/api/tones/route';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
}));

// Mock OpenAI service
jest.mock('@/lib/openai/toneAiService', () => ({
  generateToneSettings: jest.fn(),
  regenerateToneSettings: jest.fn(),
}));

// Mock rate limiting
jest.mock('@/lib/rateLimit', () => ({
  toneRateLimit: {
    limit: jest.fn().mockResolvedValue({ success: true }),
  },
  apiRateLimit: {
    limit: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('POST /api/tones', () => {
  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  it('creates a new tone with valid data', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    (generateToneSettings as jest.Mock).mockResolvedValue({
      ampSettings: {
        gain: 5,
        treble: 5,
        mid: 5,
        bass: 5,
        volume: 5,
        presence: 5,
        reverb: 3,
      },
      notes: 'Test notes',
    });

    const testUser = await createTestUser({ clerkId: 'test-user-id' });

    const req = new NextRequest('http://localhost:3000/api/tones', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Tone',
        artist: 'Test Artist',
        description: 'Test Description',
        guitar: 'Test Guitar',
        pickups: 'Test Pickups',
        strings: '.010–.046',
        amp: 'Test Amp',
        aiAmpSettings: {
          gain: 5,
          treble: 5,
          mid: 5,
          bass: 5,
          volume: 5,
          presence: 5,
          reverb: 3,
        },
        aiNotes: 'Test notes',
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(201);

    const data = await response.json();
    const tone = await prisma.tone.findUnique({
      where: {
        id: data.tone.id,
      },
    });
    expect(tone).toBeDefined();

    const user = await prisma.user.findUnique({
      where: {
        id: testUser.id,
      },
    });
    expect(user?.generationsUsed).toBe(1);
  });

  it('returns 401 when user is not authenticated', async () => {
    (currentUser as jest.Mock).mockReturnValue(null);

    const req = new NextRequest('http://localhost:3000/api/tones', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Tone',
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it('returns 400 when request body is invalid', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    await createTestUser({ clerkId: 'test-user-id' });

    const req = new NextRequest('http://localhost:3000/api/tones', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        name: 'Test Tone',
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    const errors = await response.json();
    expect(errors).toBeDefined();
  });

  it('returns 403 when user has no credits remaining', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 5,
      generationsLimit: 5,
    });

    await createTestUser({
      clerkId: 'test-user-id',
      generationsUsed: 5,
      generationsLimit: 5,
    });

    const req = new NextRequest('http://localhost:3000/api/tones', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Tone',
        artist: 'Test Artist',
        description: 'Test Description',
        guitar: 'Test Guitar',
        pickups: 'Test Pickups',
        strings: '.010–.046',
        amp: 'Test Amp',
        aiAmpSettings: {
          gain: 5,
          treble: 5,
          mid: 5,
          bass: 5,
          volume: 5,
          presence: 5,
          reverb: 3,
        },
        aiNotes: 'Test notes',
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(403);
    const errors = await response.json();
    expect(errors.code).toBe('CREDITS_EXHAUSTED');
  });

  it('returns 429 when rate limit is exceeded', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    (toneRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

    await createTestUser({ clerkId: 'test-user-id' });

    const req = new NextRequest('http://localhost:3000/api/tones', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Tone',
        artist: 'Test Artist',
        description: 'Test Description',
        guitar: 'Test Guitar',
        pickups: 'Test Pickups',
        strings: '.010–.046',
        amp: 'Test Amp',
        aiAmpSettings: {
          gain: 5,
          treble: 5,
          mid: 5,
          bass: 5,
          volume: 5,
          presence: 5,
          reverb: 3,
        },
        aiNotes: 'Test notes',
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(429);
  });
});

describe('GET /api/tones', () => {
  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  it('returns paginated list of user tones', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    const testUser = await createTestUser({ clerkId: 'test-user-id' });

    // Create 10 tones
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => createTestTone(testUser.id, { name: `Tone ${i}` }))
    );

    const req = new NextRequest('http://localhost:3000/api/tones');
    const response = await GET(req);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.tones).toHaveLength(10);
    expect(data.pagination).toMatchObject({
      page: 1,
      total: 10,
      totalPages: 1,
    });
  });

  it('returns empty array when user has no tones', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    await createTestUser({ clerkId: 'test-user-id' });

    const req = new NextRequest('http://localhost:3000/api/tones');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tones).toEqual([]);
  });

  it('respects pagination parameters', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    const testUser = await createTestUser({ clerkId: 'test-user-id' });

    // Create 15 tones
    await Promise.all(
      Array.from({ length: 15 }, (_, i) => createTestTone(testUser.id, { name: `Tone ${i}` }))
    );

    const req = new NextRequest('http://localhost:3000/api/tones?page=2&limit=5');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.tones).toHaveLength(5);
    expect(data.pagination).toMatchObject({
      page: 2,
      limit: 5,
      total: 15,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });

  it('only returns tones belonging to the authenticated user', async () => {
    // User 1
    (currentUser as jest.Mock).mockReturnValueOnce({
      id: 'user-1',
    });
    const user1 = await createTestUser({ clerkId: 'user-1', email: 'user1@example.com' });
    await createTestTone(user1.id, { name: 'User 1 Tone' });

    // User 2
    const user2 = await createTestUser({ clerkId: 'user-2', email: 'user2@example.com' });
    await createTestTone(user2.id, { name: 'User 2 Tone' });

    // Mock auth as User 1
    (currentUser as jest.Mock).mockReturnValue({
      id: 'user-1',
    });

    const req = new NextRequest('http://localhost:3000/api/tones');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tones).toHaveLength(1);
    expect(data.tones[0].name).toBe('User 1 Tone');
  });
});
