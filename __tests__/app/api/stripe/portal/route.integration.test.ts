/**
 * Integration Tests for /api/stripe/portal
 *
 * These tests use a real test database and test end-to-end flows.
 * Setup: Run with a local test database configured.
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/stripe/portal/route';
import { prisma } from '@/lib/prisma/database';
import Stripe from 'stripe';

// Mock only external dependencies (Clerk, Stripe, Rate Limiting)
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/rateLimit', () => ({
  portalRateLimit: {
    limit: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

import { auth } from '@clerk/nextjs/server';

const BASE_URL = 'http://localhost/api/stripe/portal';

describe('Integration: /api/stripe/portal', () => {
  let testUser: any;
  let mockStripe: any;
  const mockClerkUser = {
    userId: 'test_clerk_portal_integration',
  } as any;

  beforeAll(async () => {
    // Safety check: Ensure we are not running against a production database
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || (!dbUrl.includes('localhost') && !dbUrl.includes('test') && !dbUrl.includes('127.0.0.1'))) {
      throw new Error('Integration tests must be run against a local or test database (DATABASE_URL must contain "localhost", "127.0.0.1" or "test").');
    }

    // Create a test user with Stripe ID in the database
    testUser = await prisma.user.create({
      data: {
        clerkId: mockClerkUser.userId,
        email: 'portal-integration@test.com',
        stripeId: 'cus_portal_integration_test',
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
    jest.mocked(auth).mockResolvedValue(mockClerkUser as any);
    jest.clearAllMocks();
  });

  describe('POST /api/stripe/portal - End-to-End Portal Flow', () => {
    it('should create portal session for user with Stripe ID', async () => {
      (mockStripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue({
        id: 'bps_integration_test',
        url: 'https://billing.stripe.com/portal/integration-test',
      });

      const req = new NextRequest(BASE_URL, {
        method: 'POST',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.url).toBe('https://billing.stripe.com/portal/integration-test');
      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_portal_integration_test',
        return_url: expect.stringContaining('/dashboard'),
      });
    });

    it('should fail for user without Stripe ID', async () => {
      // Create user without Stripe ID
      const userWithoutStripe = await prisma.user.create({
        data: {
          clerkId: 'test_clerk_no_stripe',
          email: 'no-stripe@test.com',
          generationsUsed: 0,
          generationsLimit: 5,
        },
      });

      jest.mocked(auth).mockResolvedValue({ userId: 'test_clerk_no_stripe' } as any);

      const req = new NextRequest(BASE_URL, {
        method: 'POST',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('No subscription found');

      // Cleanup
      await prisma.user.delete({ where: { id: userWithoutStripe.id } });
    });
  });
});
