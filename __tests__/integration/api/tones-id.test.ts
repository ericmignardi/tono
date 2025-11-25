/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { cleanDatabase, createTestUser, createTestTone } from '../../../test-helpers/testDb';
import { currentUser } from '@clerk/nextjs/server';
import { regenerateToneSettings } from '@/lib/openai/toneAiService';
import { prisma } from '@/lib/prisma/database';
import { toneRateLimit, apiRateLimit } from '@/lib/rateLimit';
import { GET, PUT, DELETE } from '@/app/api/tones/[id]/route';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
}));

// Mock OpenAI service
jest.mock('@/lib/openai/toneAiService', () => ({
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

describe('GET /api/tones/[id]', () => {
  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  it('returns a single tone by ID', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    const testUser = await createTestUser({ clerkId: 'test-user-id' });
    const testTone = await createTestTone(testUser.id, { name: 'My Tone' });

    const req = new NextRequest(`http://localhost:3000/api/tones/${testTone.id}`);
    const response = await GET(req, { params: Promise.resolve({ id: testTone.id }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tone.id).toBe(testTone.id);
    expect(data.tone.name).toBe('My Tone');
  });

  it('returns 404 when tone does not exist', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    await createTestUser({ clerkId: 'test-user-id' });

    // Use a valid CUID that doesn't exist
    const nonExistentId = 'cmidfzvnp0000udlkoa25xoq9';
    const req = new NextRequest(`http://localhost:3000/api/tones/${nonExistentId}`);
    const response = await GET(req, { params: Promise.resolve({ id: nonExistentId }) });

    expect(response.status).toBe(404);
  });

  it('returns 400 when ID format is invalid', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    const req = new NextRequest('http://localhost:3000/api/tones/invalid-id');
    const response = await GET(req, { params: Promise.resolve({ id: 'invalid-id' }) });

    expect(response.status).toBe(400);
  });
});

describe('PUT /api/tones/[id]', () => {
  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  it('updates tone with valid data', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    const testUser = await createTestUser({ clerkId: 'test-user-id' });
    const testTone = await createTestTone(testUser.id, { name: 'Original Name' });

    const req = new NextRequest(`http://localhost:3000/api/tones/${testTone.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Updated Name',
      }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: testTone.id }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tone.name).toBe('Updated Name');

    const updatedTone = await prisma.tone.findUnique({ where: { id: testTone.id } });
    expect(updatedTone?.name).toBe('Updated Name');
  });

  it('regenerates AI settings when gear changes', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    (regenerateToneSettings as jest.Mock).mockResolvedValue({
      ampSettings: {
        gain: 10, // Changed from default 5
        treble: 10,
        mid: 10,
        bass: 10,
        volume: 10,
        presence: 10,
        reverb: 10,
      },
      notes: 'Regenerated notes',
    });

    const testUser = await createTestUser({ clerkId: 'test-user-id' });
    const testTone = await createTestTone(testUser.id, { amp: 'Original Amp' });

    const req = new NextRequest(`http://localhost:3000/api/tones/${testTone.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        amp: 'New Amp', // Gear change triggers regeneration
      }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: testTone.id }) });

    expect(response.status).toBe(200);
    expect(regenerateToneSettings).toHaveBeenCalled();

    const data = await response.json();
    // Check if AI settings were updated (gain 10)
    // Prisma Json type can be tricky to assert deeply, but we can check properties
    expect((data.tone.aiAmpSettings as any).gain).toBe(10);

    // Check if credit was used
    const user = await prisma.user.findUnique({ where: { id: testUser.id } });
    expect(user?.generationsUsed).toBe(1);
  });

  it('does not regenerate AI settings when only name changes', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    const testUser = await createTestUser({ clerkId: 'test-user-id' });
    const testTone = await createTestTone(testUser.id, { name: 'Original Name' });

    const req = new NextRequest(`http://localhost:3000/api/tones/${testTone.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: 'New Name', // Only name change
      }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: testTone.id }) });

    expect(response.status).toBe(200);
    expect(regenerateToneSettings).not.toHaveBeenCalled();

    // Check if credit was NOT used
    const user = await prisma.user.findUnique({ where: { id: testUser.id } });
    expect(user?.generationsUsed).toBe(0);
  });

  it('returns 403 when user has no credits for regeneration', async () => {
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

    // Create tone (bypassing credit check by direct DB creation)
    const testUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: 'test-user-id' } });
    const testTone = await createTestTone(testUser.id, { amp: 'Original Amp' });

    const req = new NextRequest(`http://localhost:3000/api/tones/${testTone.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        amp: 'New Amp', // Gear change requires credit
      }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: testTone.id }) });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.code).toBe('CREDITS_EXHAUSTED');
  });

  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  it('deletes a tone', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    const testUser = await createTestUser({ clerkId: 'test-user-id' });
    const testTone = await createTestTone(testUser.id);

    const req = new NextRequest(`http://localhost:3000/api/tones/${testTone.id}`);
    const response = await DELETE(req, { params: Promise.resolve({ id: testTone.id }) });

    expect(response.status).toBe(200);

    const deletedTone = await prisma.tone.findUnique({ where: { id: testTone.id } });
    expect(deletedTone).toBeNull();
  });

  it('returns 404 when tone does not exist', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'test-user-id',
      generationsUsed: 0,
      generationsLimit: 5,
    });

    await createTestUser({ clerkId: 'test-user-id' });

    const nonExistentId = 'cmidfzvnp0000udlkoa25xoq9';
    const req = new NextRequest(`http://localhost:3000/api/tones/${nonExistentId}`);
    const response = await DELETE(req, { params: Promise.resolve({ id: nonExistentId }) });

    expect(response.status).toBe(404);
  });

  it('returns 404 when tone belongs to different user', async () => {
    (currentUser as jest.Mock).mockReturnValue({
      id: 'user-1',
    });

    const user1 = await createTestUser({ clerkId: 'user-1', email: 'user1@example.com' });
    const user2 = await createTestUser({ clerkId: 'user-2', email: 'user2@example.com' });
    const user2Tone = await createTestTone(user2.id);

    const req = new NextRequest(`http://localhost:3000/api/tones/${user2Tone.id}`);
    const response = await DELETE(req, { params: Promise.resolve({ id: user2Tone.id }) });

    expect(response.status).toBe(404);
  });
});
