/**
 * Integration Tests for /api/stripe/checkout
 *
 * These tests use a real test database and test end-to-end flows.
 * Setup: Run with a local test database configured.
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/stripe/checkout/route';
import { prisma } from '@/lib/prisma/database';
import Stripe from 'stripe';

// Mock only external dependencies (Clerk, Stripe, Rate Limiting)
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/rateLimit', () => ({
  checkoutRateLimit: {
    limit: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

import { auth } from '@clerk/nextjs/server';

const BASE_URL = 'http://localhost/api/stripe/checkout';

describe('Integration: /api/stripe/checkout', () => {
  let testUser: any;
  let mockStripe: any;
  const mockClerkUser = {
    userId: 'test_clerk_checkout_integration',
  };

  beforeAll(async () => {
    // Safety check: Ensure we are not running against a production database
    const dbUrl = process.env.DATABASE_URL;
    if (
      !dbUrl ||
      (!dbUrl.includes('localhost') && !dbUrl.includes('test') && !dbUrl.includes('127.0.0.1'))
    ) {
      throw new Error(
        'Integration tests must be run against a local or test database (DATABASE_URL must contain "localhost", "127.0.0.1" or "test").'
      );
    }

    // Create a test user in the database
    testUser = await prisma.user.create({
      data: {
        clerkId: mockClerkUser.userId,
        email: 'checkout-integration@test.com',
        generationsUsed: 0,
        generationsLimit: 10,
      },
    });

    mockStripe = new Stripe('sk_test_mock', { apiVersion: '2025-10-29.clover' });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    (auth as unknown as jest.Mock).mockResolvedValue(mockClerkUser);
    jest.clearAllMocks();
  });

  describe('POST /api/stripe/checkout - End-to-End Checkout Flow', () => {
    const validBody = { priceId: 'price_test_123' };

    it('should create Stripe customer and update database', async () => {
      (mockStripe.customers.create as jest.Mock).mockResolvedValue({
        id: 'cus_integration_test',
      });
      (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
        id: 'cs_integration_test',
        url: 'https://checkout.stripe.com/integration-test',
      });

      const req = new NextRequest(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.url).toBe('https://checkout.stripe.com/integration-test');

      // Verify database was updated with Stripe customer ID
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser?.stripeId).toBe('cus_integration_test');
    });

    it('should reuse existing Stripe customer ID', async () => {
      // Update user with existing Stripe ID
      await prisma.user.update({
        where: { id: testUser.id },
        data: { stripeId: 'cus_existing_123' },
      });

      (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
        id: 'cs_reuse_test',
        url: 'https://checkout.stripe.com/reuse-test',
      });

      const req = new NextRequest(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.url).toBe('https://checkout.stripe.com/reuse-test');
      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing_123',
        })
      );
    });
  });
});
