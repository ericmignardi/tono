/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/webhooks/stripe/route';
import Stripe from 'stripe';

jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    webhookEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/config', () => ({
  config: {
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_mock',
  },
  FREE_CREDIT_LIMIT: 5,
  PRO_CREDIT_LIMIT: 50,
}));

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

import { prisma } from '@/lib/prisma/database';

describe('/api/webhooks/stripe', () => {
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = new Stripe('sk_test_mock', { apiVersion: '2025-10-29.clover' });
  });

  describe('POST /api/webhooks/stripe', () => {
    const mockEvent = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          mode: 'subscription',
          subscription: 'sub_test_123',
        },
      },
    };

    it('should return 400 when signature header is missing', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const res = await POST(req);
      const text = await res.text();

      expect(res.status).toBe(400);
      expect(text).toBe('Missing stripe-signature header');
    });

    it('should return 400 when signature verification fails', async () => {
      (mockStripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: { 'stripe-signature': 'invalid_signature' },
      });

      const res = await POST(req);
      const text = await res.text();

      expect(res.status).toBe(400);
      expect(text).toContain('Webhook Error');
    });

    it('should skip duplicate events', async () => {
      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        eventId: 'evt_test_123',
        processed: true,
      });

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.received).toBe(true);
      expect(prisma.webhookEvent.create).not.toHaveBeenCalled();
    });

    it('should handle checkout.session.completed event', async () => {
      const checkoutEvent = {
        id: 'evt_checkout_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            mode: 'subscription',
            subscription: 'sub_test_123',
          },
        },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(checkoutEvent);
      (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.webhookEvent.create as jest.Mock).mockResolvedValue({});
      (mockStripe.subscriptions.retrieve as jest.Mock).mockResolvedValue({
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        items: {
          data: [
            {
              id: 'si_test_123',
              price: { id: 'price_test_123' },
              current_period_end: Math.floor(Date.now() / 1000) + 2592000,
            },
          ],
        },
      });
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user_1',
        email: 'test@example.com',
        stripeId: 'cus_test_123',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.subscription.upsert as jest.Mock).mockResolvedValue({});
      (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(checkoutEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.received).toBe(true);
      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { generationsLimit: 50 },
        })
      );
    });

    it('should handle customer.subscription.created event', async () => {
      const subscriptionEvent = {
        id: 'evt_sub_created_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            items: {
              data: [
                {
                  id: 'si_test_123',
                  price: { id: 'price_test_123' },
                  current_period_end: Math.floor(Date.now() / 1000) + 2592000,
                },
              ],
            },
          },
        },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(subscriptionEvent);
      (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.webhookEvent.create as jest.Mock).mockResolvedValue({});
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user_1',
        email: 'test@example.com',
        stripeId: 'cus_test_123',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.subscription.upsert as jest.Mock).mockResolvedValue({});
      (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(subscriptionEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.received).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.subscription.upsert).toHaveBeenCalled();
    });

    it('should handle customer.subscription.deleted event', async () => {
      const deleteEvent = {
        id: 'evt_sub_deleted_123',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
          },
        },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(deleteEvent);
      (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.webhookEvent.create as jest.Mock).mockResolvedValue({});
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user_1',
        email: 'test@example.com',
        stripeId: 'cus_test_123',
        generationsUsed: 3,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.subscription.deleteMany as jest.Mock).mockResolvedValue({});
      (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(deleteEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.received).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            generationsLimit: 5,
            generationsUsed: 3,
          },
        })
      );
      expect(prisma.subscription.deleteMany).toHaveBeenCalled();
    });

    it('should handle invoice.payment_failed event', async () => {
      const paymentFailedEvent = {
        id: 'evt_payment_failed_123',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_123',
            subscription: 'sub_test_123',
          },
        },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(paymentFailedEvent);
      (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.webhookEvent.create as jest.Mock).mockResolvedValue({});
      (prisma.subscription.updateMany as jest.Mock).mockResolvedValue({});
      (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(paymentFailedEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.received).toBe(true);
      expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeId: 'sub_test_123' },
        data: { status: 'past_due' },
      });
    });

    it('should handle unhandled event types gracefully', async () => {
      const unknownEvent = {
        id: 'evt_unknown_123',
        type: 'unknown.event.type',
        data: { object: {} },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(unknownEvent);
      (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.webhookEvent.create as jest.Mock).mockResolvedValue({});
      (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(unknownEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.received).toBe(true);
    });

    it('should handle processing errors and update webhook event', async () => {
      const errorEvent = {
        id: 'evt_error_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            items: { data: [] },
          },
        },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(errorEvent);
      (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.webhookEvent.create as jest.Mock).mockResolvedValue({});
      (prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));
      (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(errorEvent),
        headers: { 'stripe-signature': 'valid_signature' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe('Webhook handler failed');
      expect(prisma.webhookEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            processed: false,
            error: 'Database error',
          }),
        })
      );
    });
  });

  describe('GET /api/webhooks/stripe', () => {
    it('should return 405 for GET requests', async () => {
      const res = await GET();
      const text = await res.text();

      expect(res.status).toBe(405);
      expect(text).toBe('Method not allowed');
    });
  });
});
