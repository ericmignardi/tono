/**
 * Integration Tests for /api/webhooks/clerk
 *
 * These tests use a real test database and test end-to-end flows.
 * Setup: Run with a local test database configured.
 *
 * @jest-environment node
 */

import { POST } from '@/app/api/webhooks/clerk/route';
import { prisma } from '@/lib/prisma/database';

// Mock only Svix and headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('svix', () => {
  return {
    Webhook: jest.fn().mockImplementation(() => ({
      verify: jest.fn(),
    })),
  };
});

import { headers } from 'next/headers';
import { Webhook } from 'svix';

describe('Integration: /api/webhooks/clerk', () => {
  let mockWebhook: any;
  const mockHeaders = {
    'svix-id': 'msg_integration_test',
    'svix-timestamp': '1234567890',
    'svix-signature': 'v1,integration_signature',
  };

  beforeAll(async () => {
    // Safety check: Ensure we are not running against a production database
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || (!dbUrl.includes('localhost') && !dbUrl.includes('test') && !dbUrl.includes('127.0.0.1'))) {
      throw new Error('Integration tests must be run against a local or test database (DATABASE_URL must contain "localhost", "127.0.0.1" or "test").');
    }

    mockWebhook = new Webhook('whsec_clerk_test_mock');
  });

  afterAll(async () => {
    // Clean up all test users created during integration tests
    await prisma.user.deleteMany({
      where: {
        clerkId: {
          startsWith: 'clerk_integration_',
        },
      },
    });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (headers as jest.Mock).mockResolvedValue(
      new Map(Object.entries(mockHeaders))
    );
  });

  describe('POST /api/webhooks/clerk - User Lifecycle', () => {
    it('should create user in database on user.created event', async () => {
      const userCreatedEvent = {
        type: 'user.created',
        data: {
          id: 'clerk_integration_created',
          email_addresses: [{ email_address: 'integration-created@test.com' }],
          first_name: 'Integration',
          last_name: 'Created',
        },
      };

      (mockWebhook.verify as jest.Mock).mockReturnValue(userCreatedEvent);

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userCreatedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { clerkId: 'clerk_integration_created' },
      });
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe('integration-created@test.com');
      expect(createdUser?.firstName).toBe('Integration');
      expect(createdUser?.lastName).toBe('Created');
    });

    it('should update user in database on user.updated event', async () => {
      // First create a user
      const initialUser = await prisma.user.create({
        data: {
          clerkId: 'clerk_integration_updated',
          email: 'old-email@test.com',
          firstName: 'Old',
          lastName: 'Name',
        },
      });

      const userUpdatedEvent = {
        type: 'user.updated',
        data: {
          id: 'clerk_integration_updated',
          email_addresses: [{ email_address: 'new-email@test.com' }],
          first_name: 'New',
          last_name: 'Name',
        },
      };

      (mockWebhook.verify as jest.Mock).mockReturnValue(userUpdatedEvent);

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userUpdatedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify user was updated in database
      const updatedUser = await prisma.user.findUnique({
        where: { clerkId: 'clerk_integration_updated' },
      });
      expect(updatedUser?.email).toBe('new-email@test.com');
      expect(updatedUser?.firstName).toBe('New');
      expect(updatedUser?.lastName).toBe('Name');
    });

    it('should delete user and related data on user.deleted event', async () => {
      // Create a user with related data
      const userToDelete = await prisma.user.create({
        data: {
          clerkId: 'clerk_integration_deleted',
          email: 'to-delete@test.com',
          firstName: 'Delete',
          lastName: 'Me',
        },
      });

      // Create a tone for this user
      await prisma.tone.create({
        data: {
          userId: userToDelete.id,
          name: 'Test Tone',
          artist: 'Test Artist',
          description: 'Test Description',
          guitar: 'Strat',
          pickups: 'Single Coil',
          strings: '.010–.046',
          amp: 'Fender',
          aiAmpSettings: { gain: 5, mid: 5, bass: 5, reverb: 5, treble: 5, volume: 5, presence: 5 },
          aiNotes: 'Test notes',
        },
      });

      const userDeletedEvent = {
        type: 'user.deleted',
        data: {
          id: 'clerk_integration_deleted',
        },
      };

      (mockWebhook.verify as jest.Mock).mockReturnValue(userDeletedEvent);

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userDeletedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify user was deleted from database
      const deletedUser = await prisma.user.findUnique({
        where: { clerkId: 'clerk_integration_deleted' },
      });
      expect(deletedUser).toBeNull();

      // Verify related tones were also deleted (cascading delete)
      const relatedTones = await prisma.tone.findMany({
        where: { userId: userToDelete.id },
      });
      expect(relatedTones.length).toBe(0);
    });

    it('should handle user.updated creating user if not exists', async () => {
      const userUpdatedEvent = {
        type: 'user.updated',
        data: {
          id: 'clerk_integration_update_create',
          email_addresses: [{ email_address: 'update-create@test.com' }],
          first_name: 'Update',
          last_name: 'Create',
        },
      };

      (mockWebhook.verify as jest.Mock).mockReturnValue(userUpdatedEvent);

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userUpdatedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify user was created
      const createdUser = await prisma.user.findUnique({
        where: { clerkId: 'clerk_integration_update_create' },
      });
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe('update-create@test.com');
    });
  });
});
