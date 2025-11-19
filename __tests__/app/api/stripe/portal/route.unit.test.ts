/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/stripe/portal/route';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/rateLimit', () => ({
  portalRateLimit: {
    limit: jest.fn(),
  },
}));

jest.mock('@/lib/config', () => ({
  config: {
    STRIPE_SECRET_KEY: 'sk_test_mock',
    NEXT_PUBLIC_URL: 'http://localhost:3000',
  },
}));

// Create a mock Stripe instance that will be reused
const mockStripeInstance = {
  billingPortal: {
    sessions: {
      create: jest.fn(),
    },
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripeInstance);
});

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import { portalRateLimit } from '@/lib/rateLimit';

describe('/api/stripe/portal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/stripe/portal', () => {
    const mockUser = {
      id: 'db_user_1',
      clerkId: 'clerk_user_123',
      email: 'test@example.com',
      stripeId: 'cus_test_123',
    };

    it('should return 401 when unauthorized', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const req = new NextRequest('http://localhost/api/stripe/portal', {
        method: 'POST',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 429 when rate limit exceeded', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'clerk_user_123' });
      (portalRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

      const req = new NextRequest('http://localhost/api/stripe/portal', {
        method: 'POST',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.error).toBe('Too many portal requests. Please try again later.');
    });

    it('should return 404 when user not found', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'clerk_user_123' });
      (portalRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/stripe/portal', {
        method: 'POST',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('User not found');
    });

    it('should return 404 when user has no stripeId', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'clerk_user_123' });
      (portalRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        stripeId: null,
      });

      const req = new NextRequest('http://localhost/api/stripe/portal', {
        method: 'POST',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('No subscription found');
    });

    it('should create portal session successfully', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'clerk_user_123' });
      (portalRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockStripeInstance.billingPortal.sessions.create as jest.Mock).mockResolvedValue({
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/portal/test',
      });

      const req = new NextRequest('http://localhost/api/stripe/portal', {
        method: 'POST',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.url).toBe('https://billing.stripe.com/portal/test');
      expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        return_url: 'http://localhost:3000/dashboard',
      });
    });

    it('should handle Stripe API errors gracefully', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'clerk_user_123' });
      (portalRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockStripeInstance.billingPortal.sessions.create as jest.Mock).mockRejectedValue(
        new Error('Stripe API error')
      );

      const req = new NextRequest('http://localhost/api/stripe/portal', {
        method: 'POST',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBeDefined();
    });
  });

  describe('GET /api/stripe/portal', () => {
    it('should return 405 for GET requests', async () => {
      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(405);
      expect(json.error).toBe('Method not allowed');
    });
  });
});
