/**
 * Integration Tests for /api/tones/[id]
 *
 * These tests use a real test database and test end-to-end flows.
 * Setup: Run `npm run test:setup` before running these tests.
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/tones/[id]/route';
import { prisma } from '@/lib/prisma/database';
import { currentUser } from '@clerk/nextjs/server';

// Mock only external dependencies
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
}));

jest.mock('@/lib/openai/toneAiService', () => ({
  regenerateToneSettings: jest.fn().mockImplementation(async (input, existing) => ({
    ampSettings: {
      gain: 8, // Different from original to verify regeneration
      mid: 6,
      bass: 6,
      reverb: 6,
      treble: 6,
      volume: 6,
      presence: 6,
    },
    notes: 'AI regenerated settings based on gear changes',
  })),
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

const BASE_URL = 'http://localhost/api/tones';

import { regenerateToneSettings } from '@/lib/openai/toneAiService';
import { toneRateLimit } from '@/lib/rateLimit';

describe('Integration: /api/tones/[id]', () => {
  let testUser: any;
  let testTone: any;
  let otherUser: any;
  let otherUserTone: any;

  const mockClerkUser = {
    id: 'test_clerk_user_id_integration',
    email: 'id-integration@test.com',
  };

  beforeAll(async () => {
    // Safety check: Ensure we are not running against a production database
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || (!dbUrl.includes('localhost') && !dbUrl.includes('test') && !dbUrl.includes('127.0.0.1'))) {
      throw new Error('Integration tests must be run against a local or test database (DATABASE_URL must contain "localhost", "127.0.0.1" or "test").');
    }

    // Create test user
    testUser = await prisma.user.create({
      data: {
        clerkId: mockClerkUser.id,
        email: mockClerkUser.email,
        generationsUsed: 0,
        generationsLimit: 10,
      },
    });

    // Create another user for authorization tests
    otherUser = await prisma.user.create({
      data: {
        clerkId: 'other_clerk_user_id',
        email: 'other-id@test.com',
        generationsUsed: 0,
        generationsLimit: 10,
      },
    });

    // Create a tone for the other user
    otherUserTone = await prisma.tone.create({
      data: {
        userId: otherUser.id,
        name: 'Other User Tone',
        artist: 'Other Artist',
        description: 'Should not be accessible',
        guitar: 'Les Paul',
        pickups: 'Humbucker',
        strings: '.010–.046',
        amp: 'Marshall',
        aiAmpSettings: {
          gain: 5,
          mid: 5,
          bass: 5,
          reverb: 5,
          treble: 5,
          volume: 5,
          presence: 5,
        },
        aiNotes: 'Original notes',
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.tone.deleteMany({ where: { userId: testUser.id } });
    await prisma.tone.deleteMany({ where: { userId: otherUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    (currentUser as jest.Mock).mockResolvedValue(mockClerkUser);
    jest.clearAllMocks();

    // Create a fresh test tone before each test
    testTone = await prisma.tone.create({
      data: {
        userId: testUser.id,
        name: 'Test Tone',
        artist: 'Test Artist',
        description: 'Test Description',
        guitar: 'Stratocaster',
        pickups: 'Single Coil',
        strings: '.010–.046',
        amp: 'Fender Twin',
        aiAmpSettings: {
          gain: 5,
          mid: 5,
          bass: 5,
          reverb: 5,
          treble: 5,
          volume: 5,
          presence: 5,
        },
        aiNotes: 'Original AI notes',
      },
    });
  });

  afterEach(async () => {
    // Clean up test tones
    await prisma.tone.deleteMany({ where: { userId: testUser.id } });
    // Reset credits
    await prisma.user.update({
      where: { id: testUser.id },
      data: { generationsUsed: 0 },
    });
  });

  describe('GET /api/tones/[id]', () => {
    it('should retrieve a specific tone by ID', async () => {
      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'GET',
      });

      const res = await GET(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tone).toMatchObject({
        id: testTone.id,
        name: 'Test Tone',
        artist: 'Test Artist',
        userId: testUser.id,
      });
    });

    it('should prevent accessing another users tone', async () => {
      const context = { params: Promise.resolve({ id: otherUserTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${otherUserTone.id}`, {
        method: 'GET',
      });

      const res = await GET(req, context);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('Tone not found');
    });

    it('should return 404 for non-existent tone', async () => {
      const fakeId = 'clx1234567890123456789012';
      const context = { params: Promise.resolve({ id: fakeId }) };
      const req = new NextRequest(`${BASE_URL}/${fakeId}`, {
        method: 'GET',
      });

      const res = await GET(req, context);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('Tone not found');
    });
  });

  describe('PUT /api/tones/[id] - Name-Only Updates', () => {
    it('should update only name without triggering AI regeneration', async () => {
      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tone.name).toBe('Updated Name');
      expect(regenerateToneSettings).not.toHaveBeenCalled();
      expect(toneRateLimit.limit).not.toHaveBeenCalled();

      // Verify in database
      const dbTone = await prisma.tone.findUnique({
        where: { id: testTone.id },
      });
      expect(dbTone?.name).toBe('Updated Name');
      expect(dbTone?.aiNotes).toBe('Original AI notes'); // Unchanged
    });

    it('should update name without consuming credits', async () => {
      const userBefore = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`http://localhost/api/tones/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Another Name' }),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(req, context);

      const userAfter = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(userAfter?.generationsUsed).toBe(userBefore?.generationsUsed);
    });
  });

  describe('PUT /api/tones/[id] - Gear Changes with AI Regeneration', () => {
    it('should regenerate AI when artist changes', async () => {
      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ artist: 'New Artist' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tone.artist).toBe('New Artist');
      expect(regenerateToneSettings).toHaveBeenCalledTimes(1);

      // Verify AI settings were updated in database
      const dbTone = await prisma.tone.findUnique({
        where: { id: testTone.id },
      });
      expect(dbTone?.aiAmpSettings).toMatchObject({ gain: 8 }); // New AI values
      expect(dbTone?.aiNotes).toBe('AI regenerated settings based on gear changes');
    });

    it('should regenerate AI when guitar changes', async () => {
      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ guitar: 'Les Paul' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);

      expect(res.status).toBe(200);
      expect(regenerateToneSettings).toHaveBeenCalled();
    });

    it('should regenerate AI when amp changes', async () => {
      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ amp: 'Marshall' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);

      expect(res.status).toBe(200);
      expect(regenerateToneSettings).toHaveBeenCalled();
    });

    it('should regenerate AI when description changes', async () => {
      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ description: 'New jazzy description' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);

      expect(res.status).toBe(200);
      expect(regenerateToneSettings).toHaveBeenCalled();
    });

    it('should update multiple gear fields and regenerate AI once', async () => {
      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          guitar: 'Les Paul',
          pickups: 'Humbucker',
          amp: 'Marshall',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.tone.guitar).toBe('Les Paul');
      expect(json.tone.pickups).toBe('Humbucker');
      expect(json.tone.amp).toBe('Marshall');
      expect(regenerateToneSettings).toHaveBeenCalledTimes(1);

      // Verify in database
      const dbTone = await prisma.tone.findUnique({
        where: { id: testTone.id },
      });
      expect(dbTone?.guitar).toBe('Les Paul');
      expect(dbTone?.pickups).toBe('Humbucker');
      expect(dbTone?.amp).toBe('Marshall');
    });

    it('should consume credit when gear changes', async () => {
      const userBefore = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`http://localhost/api/tones/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ amp: 'Vox AC30' }),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(req, context);

      const userAfter = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(userAfter?.generationsUsed).toBe((userBefore?.generationsUsed || 0) + 1);
    });

    it('should reject gear changes when credits exhausted', async () => {
      // Exhaust credits
      await prisma.user.update({
        where: { id: testUser.id },
        data: { generationsUsed: 10, generationsLimit: 10 },
      });

      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`http://localhost/api/tones/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ amp: 'Vox AC30' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe('No remaining credits. Please upgrade your plan.');

      // Verify tone was not updated
      const dbTone = await prisma.tone.findUnique({
        where: { id: testTone.id },
      });
      expect(dbTone?.amp).toBe('Fender Twin'); // Original value
    });

    it('should prevent updating another users tone', async () => {
      const context = { params: Promise.resolve({ id: otherUserTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${otherUserTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Hacked Name' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PUT(req, context);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('Tone not found');

      // Verify other user's tone was not changed
      const dbTone = await prisma.tone.findUnique({
        where: { id: otherUserTone.id },
      });
      expect(dbTone?.name).toBe('Other User Tone');
    });
  });

  describe('DELETE /api/tones/[id]', () => {
    it('should delete a tone successfully', async () => {
      const context = { params: Promise.resolve({ id: testTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'DELETE',
      });

      const res = await DELETE(req, context);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.message).toBe('Successfully deleted tone');

      // Verify deletion in database
      const dbTone = await prisma.tone.findUnique({
        where: { id: testTone.id },
      });
      expect(dbTone).toBeNull();
    });

    it('should prevent deleting another users tone', async () => {
      const context = { params: Promise.resolve({ id: otherUserTone.id }) };
      const req = new NextRequest(`${BASE_URL}/${otherUserTone.id}`, {
        method: 'DELETE',
      });

      const res = await DELETE(req, context);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('Tone not found');

      // Verify other user's tone still exists
      const dbTone = await prisma.tone.findUnique({
        where: { id: otherUserTone.id },
      });
      expect(dbTone).not.toBeNull();
    });

    it('should return 404 when deleting non-existent tone', async () => {
      const fakeId = 'clx1234567890123456789012';
      const context = { params: Promise.resolve({ id: fakeId }) };
      const req = new NextRequest(`${BASE_URL}/${fakeId}`, {
        method: 'DELETE',
      });

      const res = await DELETE(req, context);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('Tone not found');
    });
  });

  describe('Complete CRUD Lifecycle', () => {
    it('should handle create, read, update (name), update (gear), delete flow', async () => {
      // 1. CREATE (done in beforeEach)
      expect(testTone.id).toBeDefined();

      // 2. READ
      const getContext = { params: Promise.resolve({ id: testTone.id }) };
      const getReq = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'GET',
      });
      const getRes = await GET(getReq, getContext);
      expect(getRes.status).toBe(200);

      // 3. UPDATE (name only - no AI)
      const updateNameContext = { params: Promise.resolve({ id: testTone.id }) };
      const updateNameReq = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated via CRUD' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const updateNameRes = await PUT(updateNameReq, updateNameContext);
      expect(updateNameRes.status).toBe(200);
      expect(regenerateToneSettings).not.toHaveBeenCalled();

      // 4. UPDATE (gear - triggers AI)
      const updateGearContext = { params: Promise.resolve({ id: testTone.id }) };
      const updateGearReq = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'PUT',
        body: JSON.stringify({ amp: 'Marshall JCM800' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const updateGearRes = await PUT(updateGearReq, updateGearContext);
      expect(updateGearRes.status).toBe(200);
      expect(regenerateToneSettings).toHaveBeenCalled();

      // 5. DELETE
      const deleteContext = { params: Promise.resolve({ id: testTone.id }) };
      const deleteReq = new NextRequest(`${BASE_URL}/${testTone.id}`, {
        method: 'DELETE',
      });
      const deleteRes = await DELETE(deleteReq, deleteContext);
      expect(deleteRes.status).toBe(200);

      // 6. VERIFY DELETION
      const verifyTone = await prisma.tone.findUnique({
        where: { id: testTone.id },
      });
      expect(verifyTone).toBeNull();
    });
  });
});
