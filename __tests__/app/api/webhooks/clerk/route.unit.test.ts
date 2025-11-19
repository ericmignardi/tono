/**
 * @jest-environment node
 */

import { POST, GET } from '@/app/api/webhooks/clerk/route';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/config', () => ({
  config: {
    CLERK_WEBHOOK_SECRET: 'whsec_clerk_test_mock',
  },
}));

jest.mock('svix', () => {
  return {
    Webhook: jest.fn().mockImplementation(() => ({
      verify: jest.fn(),
    })),
  };
});

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/database';
import { Webhook } from 'svix';

describe('/api/webhooks/clerk', () => {
  let mockWebhook: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebhook = new Webhook('whsec_clerk_test_mock');
  });

  describe('POST /api/webhooks/clerk', () => {
    const mockHeaders = {
      'svix-id': 'msg_test_123',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,test_signature',
    };

    it('should return 500 when webhook secret is missing', async () => {
      // Temporarily remove webhook secret
      jest.resetModules();
      jest.mock('@/lib/config', () => ({
        config: {
          CLERK_WEBHOOK_SECRET: undefined,
        },
      }));

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      const text = await res.text();

      expect(res.status).toBe(500);
      expect(text).toBe('Webhook secret missing');
    });

    it('should return 400 when required headers are missing', async () => {
      (headers as jest.Mock).mockResolvedValue(
        new Map([
          ['svix-id', ''],
          ['svix-timestamp', ''],
          ['svix-signature', ''],
        ])
      );

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      const text = await res.text();

      expect(res.status).toBe(400);
      expect(text).toBe('Missing required headers');
    });

    it('should return 400 when signature verification fails', async () => {
      (headers as jest.Mock).mockResolvedValue(
        new Map(Object.entries(mockHeaders))
      );
      (mockWebhook.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      const text = await res.text();

      expect(res.status).toBe(400);
      expect(text).toBe('Invalid signature');
    });

    it('should handle user.created event', async () => {
      const userCreatedEvent = {
        type: 'user.created',
        data: {
          id: 'clerk_user_123',
          email_addresses: [{ email_address: 'newuser@test.com' }],
          first_name: 'John',
          last_name: 'Doe',
        },
      };

      (headers as jest.Mock).mockResolvedValue(
        new Map(Object.entries(mockHeaders))
      );
      (mockWebhook.verify as jest.Mock).mockReturnValue(userCreatedEvent);
      (prisma.user.upsert as jest.Mock).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_123',
        email: 'newuser@test.com',
      });

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userCreatedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_user_123' },
        update: {
          email: 'newuser@test.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        create: {
          clerkId: 'clerk_user_123',
          email: 'newuser@test.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    it('should handle user.updated event for existing user', async () => {
      const userUpdatedEvent = {
        type: 'user.updated',
        data: {
          id: 'clerk_user_123',
          email_addresses: [{ email_address: 'updated@test.com' }],
          first_name: 'Jane',
          last_name: 'Smith',
        },
      };

      (headers as jest.Mock).mockResolvedValue(
        new Map(Object.entries(mockHeaders))
      );
      (mockWebhook.verify as jest.Mock).mockReturnValue(userUpdatedEvent);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_123',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_123',
        email: 'updated@test.com',
      });

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userUpdatedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_user_123' },
        data: {
          email: 'updated@test.com',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      });
    });

    it('should create user if not found during update', async () => {
      const userUpdatedEvent = {
        type: 'user.updated',
        data: {
          id: 'clerk_user_new',
          email_addresses: [{ email_address: 'new@test.com' }],
          first_name: 'New',
          last_name: 'User',
        },
      };

      (headers as jest.Mock).mockResolvedValue(
        new Map(Object.entries(mockHeaders))
      );
      (mockWebhook.verify as jest.Mock).mockReturnValue(userUpdatedEvent);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user_new',
        clerkId: 'clerk_user_new',
      });

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userUpdatedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: 'clerk_user_new',
          email: 'new@test.com',
          firstName: 'New',
          lastName: 'User',
        },
      });
    });

    it('should handle user.deleted event', async () => {
      const userDeletedEvent = {
        type: 'user.deleted',
        data: {
          id: 'clerk_user_123',
        },
      };

      (headers as jest.Mock).mockResolvedValue(
        new Map(Object.entries(mockHeaders))
      );
      (mockWebhook.verify as jest.Mock).mockReturnValue(userDeletedEvent);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_123',
      });
      (prisma.user.delete as jest.Mock).mockResolvedValue({});

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userDeletedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_user_123' },
      });
    });

    it('should handle user.deleted event when user does not exist', async () => {
      const userDeletedEvent = {
        type: 'user.deleted',
        data: {
          id: 'clerk_user_nonexistent',
        },
      };

      (headers as jest.Mock).mockResolvedValue(
        new Map(Object.entries(mockHeaders))
      );
      (mockWebhook.verify as jest.Mock).mockReturnValue(userDeletedEvent);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userDeletedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should handle unhandled event types gracefully', async () => {
      const unknownEvent = {
        type: 'unknown.event.type',
        data: { id: 'test_123' },
      };

      (headers as jest.Mock).mockResolvedValue(
        new Map(Object.entries(mockHeaders))
      );
      (mockWebhook.verify as jest.Mock).mockReturnValue(unknownEvent);

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(unknownEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should handle processing errors and return 500', async () => {
      const userCreatedEvent = {
        type: 'user.created',
        data: {
          id: 'clerk_user_error',
          email_addresses: [{ email_address: 'error@test.com' }],
          first_name: 'Error',
          last_name: 'User',
        },
      };

      (headers as jest.Mock).mockResolvedValue(
        new Map(Object.entries(mockHeaders))
      );
      (mockWebhook.verify as jest.Mock).mockReturnValue(userCreatedEvent);
      (prisma.user.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(userCreatedEvent),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe('Webhook processing failed');
      expect(json.details).toBe('Database error');
    });
  });

  describe('GET /api/webhooks/clerk', () => {
    it('should return 405 for GET requests', async () => {
      const res = await GET();
      const text = await res.text();

      expect(res.status).toBe(405);
      expect(text).toBe('Method not allowed');
    });
  });
});
