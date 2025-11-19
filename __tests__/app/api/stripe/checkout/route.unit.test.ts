/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/stripe/checkout/route';
import Stripe from 'stripe';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/rateLimit', () => ({
  checkoutRateLimit: {
    limit: jest.fn(),
  },
}));

jest.mock('@/lib/config', () => ({
  config: {
    STRIPE_SECRET_KEY: 'sk_test_mock',
    NEXT_PUBLIC_URL: 'http://localhost:3000',
  },
  ALLOWED_PRICE_IDS: ['price_test_123', 'price_test_456'],
}));

// Create a mock Stripe instance that will be reused
const mockStripeInstance = {
  customers: {
    create: jest.fn(),
  },
  checkout: {
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
import { checkoutRateLimit } from '@/lib/rateLimit';

// Type the mocked auth function properly
const mockedAuth = auth as unknown as jest.Mock;

describe('/api/stripe/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/stripe/checkout', () => {
    const validBody = { priceId: 'price_test_123' };
    const mockUser = {
      id: 'db_user_1',
      clerkId: 'clerk_user_123',
      email: 'test@example.com',
      stripeId: null,
    };

    it('should return 401 when unauthorized', async () => {
      mockedAuth.mockResolvedValue({ userId: null });

      const req = new NextRequest('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 429 when rate limit exceeded', async () => {
      mockedAuth.mockResolvedValue({ userId: 'clerk_user_123' });
      (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

      const req = new NextRequest('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.error).toBe('Too many checkout attempts. Please try again later.');
    });

    it('should return 400 when priceId is missing', async () => {
      mockedAuth.mockResolvedValue({ userId: 'clerk_user_123' });
      (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });

      const req = new NextRequest('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Price ID is required');
    });

    it('should return 400 when priceId is invalid', async () => {
      mockedAuth.mockResolvedValue({ userId: 'clerk_user_123' });
      (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });

      const req = new NextRequest('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId: 'price_invalid' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid price ID');
    });

    it('should return 404 when user not found', async () => {
      mockedAuth.mockResolvedValue({ userId: 'clerk_user_123' });
      (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('User not found');
    });

    it('should create checkout session for user with existing stripeId', async () => {
      const userWithStripe = { ...mockUser, stripeId: 'cus_test_123' };
      mockedAuth.mockResolvedValue({ userId: 'clerk_user_123' });
      (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithStripe);
      (mockStripeInstance.checkout.sessions.create as jest.Mock).mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const req = new NextRequest('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.url).toBe('https://checkout.stripe.com/test');
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer: 'cus_test_123',
          line_items: [{ price: 'price_test_123', quantity: 1 }],
        })
      );
    });

    it('should create Stripe customer and checkout session for new user', async () => {
      mockedAuth.mockResolvedValue({ userId: 'clerk_user_123' });
      (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockStripeInstance.customers.create as jest.Mock).mockResolvedValue({
        id: 'cus_new_123',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        stripeId: 'cus_new_123',
      });
      (mockStripeInstance.checkout.sessions.create as jest.Mock).mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const req = new NextRequest('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.url).toBe('https://checkout.stripe.com/test');
      expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: {
          clerkId: 'clerk_user_123',
          userId: 'db_user_1',
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_user_123' },
        data: { stripeId: 'cus_new_123' },
      });
    });

    it('should handle Stripe API errors gracefully', async () => {
      mockedAuth.mockResolvedValue({ userId: 'clerk_user_123' });
      (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        stripeId: 'cus_test_123',
      });
      (mockStripeInstance.checkout.sessions.create as jest.Mock).mockRejectedValue(
        new Error('Stripe API error')
      );

      const req = new NextRequest('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBeDefined();
    });
  });

  describe('GET /api/stripe/checkout', () => {
    it('should return 405 for GET requests', async () => {
      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(405);
      expect(json.error).toBe('Method not allowed');
    });
  });
});
