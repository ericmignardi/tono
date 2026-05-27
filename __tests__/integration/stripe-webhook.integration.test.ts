/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    webhookEvent: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('stripe', () => {
  const constructEvent = jest.fn();
  const retrieveSubscription = jest.fn();
  const StripeMock = jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent },
    subscriptions: { retrieve: retrieveSubscription },
  })) as unknown as jest.Mock & {
    __mocks: { constructEvent: jest.Mock; retrieveSubscription: jest.Mock };
  };
  StripeMock.__mocks = { constructEvent, retrieveSubscription };
  return StripeMock;
});

import StripeMockImport from 'stripe';
import { POST, GET } from '@/app/api/webhooks/stripe/route';
import { prisma } from '@/lib/prisma/database';

const { constructEvent: constructEventMock, retrieveSubscription: retrieveSubscriptionMock } = (
  StripeMockImport as unknown as { __mocks: { constructEvent: jest.Mock; retrieveSubscription: jest.Mock } }
).__mocks;

function makeRequest(body: string, signature: string | null = 'sig_test'): NextRequest {
  const headers = new Headers();
  if (signature) headers.set('stripe-signature', signature);
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers,
  });
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.webhookEvent.upsert as jest.Mock).mockResolvedValue({});
    (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const res = await POST(makeRequest('{}', null));

    expect(res.status).toBe(400);
    expect(await res.text()).toMatch(/Missing stripe-signature/);
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it('returns 400 when signature verification fails', async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const res = await POST(makeRequest('{}', 'invalid'));

    expect(res.status).toBe(400);
    expect(await res.text()).toMatch(/Webhook Error/);
  });

  it('skips already-processed events (idempotency)', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_already_processed',
      type: 'checkout.session.completed',
      data: { object: {} },
    });
    (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue({
      eventId: 'evt_already_processed',
      processed: true,
    });

    const res = await POST(makeRequest('{}'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(prisma.webhookEvent.upsert).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('retries events where processed=false (failed prior attempt)', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_failed_before',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_1',
          customer: 'cus_1',
          status: 'active',
          cancel_at_period_end: false,
          items: {
            data: [
              {
                price: { id: 'price_pro' },
                current_period_end: 1735689600,
              },
            ],
          },
        },
      },
    });
    (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue({
      eventId: 'evt_failed_before',
      processed: false,
    });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'u_1',
      email: 'a@b.com',
      stripeId: 'cus_1',
    });
    (prisma.subscription.upsert as jest.Mock).mockResolvedValue({});

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    // Critical: upsert was called → retry path executed
    expect(prisma.webhookEvent.upsert).toHaveBeenCalled();
    expect(prisma.subscription.upsert).toHaveBeenCalled();
  });

  it('handles checkout.session.completed: upgrades user to Pro and resets usage', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_checkout_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_1',
          mode: 'subscription',
          subscription: 'sub_new_1',
        },
      },
    });
    retrieveSubscriptionMock.mockResolvedValue({
      id: 'sub_new_1',
      customer: 'cus_2',
      status: 'active',
      cancel_at_period_end: false,
      items: {
        data: [{ price: { id: 'price_pro' }, current_period_end: 1735689600 }],
      },
    });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'u_2',
      email: 'pro@example.com',
      stripeId: 'cus_2',
    });
    (prisma.subscription.upsert as jest.Mock).mockResolvedValue({});

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u_2' },
      data: expect.objectContaining({
        generationsUsed: 0,
        generationsLimit: 50,
      }),
    });
    expect(prisma.subscription.upsert).toHaveBeenCalled();
  });

  it('handles customer.subscription.deleted: downgrades to free tier, caps usage', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_canceled_1',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_canceled',
          customer: 'cus_3',
          status: 'canceled',
        },
      },
    });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'u_3',
      email: 'free@example.com',
      stripeId: 'cus_3',
      generationsUsed: 25, // above free cap of 5
    });
    (prisma.subscription.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u_3' },
      data: {
        generationsLimit: 5,
        generationsUsed: 5, // clamped to free limit
      },
    });
    expect(prisma.subscription.deleteMany).toHaveBeenCalledWith({
      where: { stripeId: 'sub_canceled' },
    });
  });

  it('handles customer.subscription.deleted gracefully when user is not found', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_canceled_ghost',
      type: 'customer.subscription.deleted',
      data: {
        object: { id: 'sub_x', customer: 'cus_x', status: 'canceled' },
      },
    });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.subscription.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.subscription.deleteMany).toHaveBeenCalled();
  });

  it('handles invoice.payment_failed: marks subscription past_due', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_failed_payment',
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_1',
          parent: {
            type: 'subscription_details',
            subscription_details: { subscription: 'sub_failing' },
          },
        },
      },
    });
    (prisma.subscription.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
      where: { stripeId: 'sub_failing' },
      data: { status: 'past_due' },
    });
  });

  it('handles invoice.payment_succeeded for subscription_cycle: resets credits', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_renewal',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_renew',
          billing_reason: 'subscription_cycle',
          parent: {
            type: 'subscription_details',
            subscription_details: { subscription: 'sub_renewing' },
          },
        },
      },
    });
    (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({ userId: 'u_renew' });

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u_renew' },
      data: expect.objectContaining({
        generationsUsed: 0,
        generationsLimit: 50,
      }),
    });
  });

  it('skips invoice.payment_succeeded when billing_reason is NOT subscription_cycle', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_initial_invoice',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_initial',
          billing_reason: 'subscription_create',
          parent: {
            type: 'subscription_details',
            subscription_details: { subscription: 'sub_new' },
          },
        },
      },
    });

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.subscription.findUnique).not.toHaveBeenCalled();
  });

  it('returns 200 even when handler throws (to prevent endless Stripe retries)', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_boom',
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_boom', customer: 'cus_boom', status: 'canceled' } },
    });
    (prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('DB exploded'));

    const res = await POST(makeRequest('{}'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(json.error).toBe('Webhook handler failed');
  });

  it('marks event as processed after a successful run', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_ok',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_ok',
          customer: 'cus_ok',
          status: 'active',
          cancel_at_period_end: false,
          items: {
            data: [{ price: { id: 'price_pro' }, current_period_end: 1735689600 }],
          },
        },
      },
    });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'u_ok',
      email: 'ok@example.com',
      stripeId: 'cus_ok',
    });
    (prisma.subscription.upsert as jest.Mock).mockResolvedValue({});

    await POST(makeRequest('{}'));

    expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
      where: { eventId: 'evt_ok' },
      data: { processed: true },
    });
  });
});

describe('GET /api/webhooks/stripe', () => {
  it('returns 405 Method Not Allowed', async () => {
    const res = await GET();
    expect(res.status).toBe(405);
  });
});
