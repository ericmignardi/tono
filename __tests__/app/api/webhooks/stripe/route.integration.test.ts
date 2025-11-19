/**
 * Integration Tests for /api/webhooks/stripe
 *
 * These tests use a real test database and test end-to-end flows.
 * Setup: Run with a local test database configured.
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/stripe/route';
import { prisma } from '@/lib/prisma/database';
import Stripe from 'stripe';

// Mock only Stripe library
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
  }));
});

const BASE_URL = 'http://localhost/api/webhooks/stripe';

describe('Integration: /api/webhooks/stripe', () => {
  let testUser: any;
  let mockStripe: any;

  beforeAll(async () => {
    // Safety check: Ensure we are not running against a production database
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || (!dbUrl.includes('localhost') && !dbUrl.includes('test') && !dbUrl.includes('127.0.0.1'))) {
      throw new Error('Integration tests must be run against a local or test database (DATABASE_URL must contain "localhost", "127.0.0.1" or "test").');
    }

    // Create a test user with Stripe ID
    testUser = await prisma.user.create({
      data: {
        clerkId: 'test_clerk_stripe_webhook',
        email: 'stripe-webhook@test.com',
        stripeId: 'cus_webhook_test',
        generationsUsed: 0,
        generationsLimit: 5,
      },
    });

    mockStripe = new Stripe('sk_test_mock', { apiVersion: '2025-10-29.clover' });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.subscription.deleteMany({ where: { userId: testUser.id } });
    await prisma.webhookEvent.deleteMany({ where: { eventId: { startsWith: 'evt_integration_' } } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/webhooks/stripe - Subscription Events', () => {
    it('should create subscription and upgrade user on subscription.created', async () => {
      const subscriptionEvent = {
        id: 'evt_integration_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_integration_test',
            customer: 'cus_webhook_test',
            status: 'active',
            items: {
              data: [
                {
                  id: 'si_integration_test',
                  price: { id: 'price_test_123' },
                  current_period_end: Math.floor(Date.now() / 1000) + 2592000,
                },
              ],
            },
          },
        },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(subscriptionEvent);

      const req = new NextRequest(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(subscriptionEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.received).toBe(true);

      // Verify user was upgraded
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser?.generationsLimit).toBe(50);

      // Verify subscription was created
      const subscription = await prisma.subscription.findUnique({
        where: { stripeId: 'sub_integration_test' },
      });
      expect(subscription).toBeDefined();
      expect(subscription?.status).toBe('active');
      expect(subscription?.userId).toBe(testUser.id);
    });

    it('should downgrade user on subscription.deleted', async () => {
      // First create a subscription
      await prisma.subscription.create({
        data: {
          stripeId: 'sub_to_delete',
          status: 'active',
          priceId: 'price_test_123',
          userId: testUser.id,
          currentPeriodEnd: new Date(Date.now() + 2592000000),
        },
      });

      // Update user to PRO
      await prisma.user.update({
        where: { id: testUser.id },
        data: { generationsLimit: 50, generationsUsed: 10 },
      });

      const deleteEvent = {
        id: 'evt_integration_sub_deleted',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_to_delete',
            customer: 'cus_webhook_test',
          },
        },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(deleteEvent);

      const req = new NextRequest(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(deleteEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.received).toBe(true);

      // Verify user was downgraded
      const downgradedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(downgradedUser?.generationsLimit).toBe(5);
      expect(downgradedUser?.generationsUsed).toBe(5); // Capped at free limit

      // Verify subscription was deleted
      const subscription = await prisma.subscription.findUnique({
        where: { stripeId: 'sub_to_delete' },
      });
      expect(subscription).toBeNull();
    });

    it('should prevent duplicate event processing', async () => {
      const duplicateEvent = {
        id: 'evt_integration_duplicate',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_duplicate_test',
            customer: 'cus_webhook_test',
            status: 'active',
            items: {
              data: [
                {
                  id: 'si_duplicate_test',
                  price: { id: 'price_test_123' },
                  current_period_end: Math.floor(Date.now() / 1000) + 2592000,
                },
              ],
            },
          },
        },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(duplicateEvent);

      // First request
      const req1 = new NextRequest(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(duplicateEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res1 = await POST(req1);
      expect(res1.status).toBe(200);

      // Second request (duplicate)
      const req2 = new NextRequest(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(duplicateEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res2 = await POST(req2);
      const json2 = await res2.json();

      expect(res2.status).toBe(200);
      expect(json2.received).toBe(true);

      // Verify webhook event was only created once
      const webhookEvents = await prisma.webhookEvent.findMany({
        where: { eventId: 'evt_integration_duplicate' },
      });
      expect(webhookEvents.length).toBe(1);
    });
  });
});
