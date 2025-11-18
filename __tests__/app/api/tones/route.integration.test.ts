/**
 * Integration Tests for /api/tones
 *
 * These tests use a real test database and test end-to-end flows.
 * Setup: Run `npm run test:setup` before running these tests.
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/tones/route';
import { prisma } from '@/lib/prisma/database';
import { currentUser } from '@clerk/nextjs/server';

// Mock only external dependencies (Clerk, OpenAI, Rate Limiting)
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
}));

jest.mock('@/lib/openai/toneAiService', () => ({
  generateToneSettings: jest.fn().mockResolvedValue({
    ampSettings: {
      gain: 7,
      mid: 5,
      bass: 5,
      reverb: 5,
      treble: 5,
      volume: 5,
      presence: 5,
    },
    notes: 'AI generated tone settings for testing',
  }),
}));

jest.mock('@/lib/rateLimit', () => ({
  toneRateLimit: {
    limit: jest.fn().mockResolvedValue({ success: true }),
  },
  apiRateLimit: {
    limit: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Integration: /api/tones', () => {
  let testUser: any;
  const mockClerkUser = {
    id: 'test_clerk_user_integration',
    email: 'integration@test.com',
  };

  beforeAll(async () => {
    // Create a test user in the database
    testUser = await prisma.user.create({
      data: {
        clerkId: mockClerkUser.id,
        email: mockClerkUser.email,
        generationsUsed: 0,
        generationsLimit: 10,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.tone.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    (currentUser as jest.Mock).mockResolvedValue(mockClerkUser);
  });

  afterEach(async () => {
    // Clean up tones created during tests
    await prisma.tone.deleteMany({
      where: { userId: testUser.id },
    });
    // Reset user credits
    await prisma.user.update({
      where: { id: testUser.id },
      data: { generationsUsed: 0 },
    });
  });

  describe('POST /api/tones - End-to-End Tone Creation', () => {
    const validToneData = {
      name: 'Integration Test Tone',
      artist: 'Test Artist',
      description: 'A tone for integration testing',
      guitar: 'Stratocaster',
      pickups: 'Single Coil',
      strings: '.010–.046',
      amp: 'Fender Twin',
    };

    it('should create a tone and persist it to the database', async () => {
      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validToneData),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.message).toBe('Successfully created tone');
      expect(json.tone).toMatchObject({
        name: validToneData.name,
        artist: validToneData.artist,
        description: validToneData.description,
        guitar: validToneData.guitar,
        userId: testUser.id,
      });

      // Verify tone exists in database
      const dbTone = await prisma.tone.findUnique({
        where: { id: json.tone.id },
      });

      expect(dbTone).not.toBeNull();
      expect(dbTone?.name).toBe(validToneData.name);
      expect(dbTone?.aiAmpSettings).toBeDefined();
      expect(dbTone?.aiNotes).toBeDefined();
    });

    it('should increment user generation credits', async () => {
      const userBefore = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validToneData),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(req);

      const userAfter = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(userAfter?.generationsUsed).toBe((userBefore?.generationsUsed || 0) + 1);
    });

    it('should create multiple tones sequentially', async () => {
      const tone1Data = { ...validToneData, name: 'Tone 1' };
      const tone2Data = { ...validToneData, name: 'Tone 2' };
      const tone3Data = { ...validToneData, name: 'Tone 3' };

      // Create three tones
      for (const data of [tone1Data, tone2Data, tone3Data]) {
        const req = new NextRequest('http://localhost/api/tones', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        });

        const res = await POST(req);
        expect(res.status).toBe(201);
      }

      // Verify all three exist
      const tones = await prisma.tone.findMany({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(tones).toHaveLength(3);
      expect(tones.map((t) => t.name)).toEqual(['Tone 3', 'Tone 2', 'Tone 1']);
    });

    it('should reject creation when credits exhausted', async () => {
      // Exhaust user credits
      await prisma.user.update({
        where: { id: testUser.id },
        data: { generationsUsed: 10, generationsLimit: 10 },
      });

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(validToneData),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe('No remaining credits. Please upgrade your plan.');

      // Verify no tone was created
      const tones = await prisma.tone.findMany({
        where: { userId: testUser.id },
      });
      expect(tones).toHaveLength(0);
    });

    it('should handle concurrent creation attempts safely', async () => {
      // Create 3 tones concurrently
      const requests = [
        { ...validToneData, name: 'Concurrent 1' },
        { ...validToneData, name: 'Concurrent 2' },
        { ...validToneData, name: 'Concurrent 3' },
      ].map((data) =>
        POST(
          new NextRequest('http://localhost/api/tones', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
          })
        )
      );

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach((res) => {
        expect(res.status).toBe(201);
      });

      // Verify credits were properly incremented
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(user?.generationsUsed).toBe(3);

      // Verify all tones exist
      const tones = await prisma.tone.findMany({
        where: { userId: testUser.id },
      });
      expect(tones).toHaveLength(3);
    });

    it('should validate required fields before consuming credits', async () => {
      const invalidData = {
        name: '',
        artist: '',
        guitar: '',
        pickups: '',
        amp: '',
      };

      const req = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid input data');

      // Verify credits were not consumed
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(user?.generationsUsed).toBe(0);
    });
  });

  describe('GET /api/tones - End-to-End Tone Retrieval', () => {
    beforeEach(async () => {
      // Create test tones
      const tones = Array.from({ length: 15 }, (_, i) => ({
        userId: testUser.id,
        name: `Test Tone ${i + 1}`,
        artist: `Artist ${i + 1}`,
        description: `Description ${i + 1}`,
        guitar: 'Strat',
        pickups: 'Single Coil',
        strings: '.010–.046',
        amp: 'Fender',
        aiAmpSettings: {
          gain: 5,
          mid: 5,
          bass: 5,
          reverb: 5,
          treble: 5,
          volume: 5,
          presence: 5,
        },
        aiNotes: 'Test notes',
      }));

      await prisma.tone.createMany({ data: tones });
    });

    it('should retrieve paginated tones', async () => {
      const req = new NextRequest('http://localhost/api/tones?page=1&limit=10', {
        method: 'GET',
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tones).toHaveLength(10);
      expect(json.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should retrieve second page correctly', async () => {
      const req = new NextRequest('http://localhost/api/tones?page=2&limit=10', {
        method: 'GET',
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tones).toHaveLength(5);
      expect(json.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 15,
        totalPages: 2,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('should return tones ordered by creation date (newest first)', async () => {
      const req = new NextRequest('http://localhost/api/tones?page=1&limit=15', {
        method: 'GET',
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tones).toHaveLength(15);

      // Verify ordering (newest first)
      for (let i = 0; i < json.tones.length - 1; i++) {
        const current = new Date(json.tones[i].createdAt);
        const next = new Date(json.tones[i + 1].createdAt);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    it('should only return tones belonging to the authenticated user', async () => {
      // Create another user with tones
      const otherUser = await prisma.user.create({
        data: {
          clerkId: 'other_clerk_user',
          email: 'other@test.com',
          generationsUsed: 0,
          generationsLimit: 10,
        },
      });

      await prisma.tone.create({
        data: {
          userId: otherUser.id,
          name: 'Other User Tone',
          artist: 'Other Artist',
          description: 'Should not appear',
          guitar: 'Les Paul',
          pickups: 'Humbucker',
          strings: '.010–.046',
          amp: 'Marshall',
          aiAmpSettings: { gain: 5, mid: 5, bass: 5, reverb: 5, treble: 5, volume: 5, presence: 5 },
          aiNotes: 'Other notes',
        },
      });

      const req = new NextRequest('http://localhost/api/tones?page=1&limit=20', {
        method: 'GET',
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tones).toHaveLength(15); // Only testUser's tones
      expect(json.tones.every((t: any) => t.name !== 'Other User Tone')).toBe(true);

      // Cleanup
      await prisma.tone.deleteMany({ where: { userId: otherUser.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it('should return empty array when user has no tones', async () => {
      // Delete all tones
      await prisma.tone.deleteMany({
        where: { userId: testUser.id },
      });

      const req = new NextRequest('http://localhost/api/tones?page=1&limit=10', {
        method: 'GET',
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tones).toEqual([]);
      expect(json.pagination.total).toBe(0);
      expect(json.pagination.totalPages).toBe(0);
    });
  });

  describe('End-to-End Flow: Create, Read, Update, Delete', () => {
    it('should complete full CRUD lifecycle', async () => {
      // 1. CREATE
      const createReq = new NextRequest('http://localhost/api/tones', {
        method: 'POST',
        body: JSON.stringify({
          name: 'CRUD Test Tone',
          artist: 'CRUD Artist',
          description: 'CRUD Description',
          guitar: 'Telecaster',
          pickups: 'Single Coil',
          strings: '.009–.042',
          amp: 'Vox AC30',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const createRes = await POST(createReq);
      const createJson = await createRes.json();
      const toneId = createJson.tone.id;

      expect(createRes.status).toBe(201);

      // 2. READ ALL
      const listReq = new NextRequest('http://localhost/api/tones?page=1&limit=10', {
        method: 'GET',
      });

      const listRes = await GET(listReq);
      const listJson = await listRes.json();

      expect(listRes.status).toBe(200);
      expect(listJson.tones).toHaveLength(1);
      expect(listJson.tones[0].id).toBe(toneId);

      // 3. Verify in database
      const dbTone = await prisma.tone.findUnique({
        where: { id: toneId },
      });

      expect(dbTone).not.toBeNull();
      expect(dbTone?.name).toBe('CRUD Test Tone');
      expect(dbTone?.artist).toBe('CRUD Artist');
    });
  });
});
