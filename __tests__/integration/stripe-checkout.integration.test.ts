/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

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
  checkoutRateLimit: { limit: jest.fn() },
}));

jest.mock('stripe', () => {
  const customersCreate = jest.fn();
  const sessionsCreate = jest.fn();
  const StripeMock = jest.fn().mockImplementation(() => ({
    customers: { create: customersCreate },
    checkout: { sessions: { create: sessionsCreate } },
  })) as unknown as jest.Mock & {
    __mocks: { customersCreate: jest.Mock; sessionsCreate: jest.Mock };
  };
  StripeMock.__mocks = { customersCreate, sessionsCreate };
  return StripeMock;
});

import StripeMockImport from 'stripe';
import { POST, GET } from '@/app/api/stripe/checkout/route';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import { checkoutRateLimit } from '@/lib/rateLimit';
import { config } from '@/lib/config';

const { customersCreate: customersCreateMock, sessionsCreate: sessionsCreateMock } = (
  StripeMockImport as unknown as {
    __mocks: { customersCreate: jest.Mock; sessionsCreate: jest.Mock };
  }
).__mocks;

const validPriceId = config.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/stripe/checkout', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

    const res = await POST(makeRequest({ priceId: validPriceId }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 429 when checkout rate limit is exceeded', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_1' });
    (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });

    const res = await POST(makeRequest({ priceId: validPriceId }));
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toMatch(/Too many checkout/i);
  });

  it('returns 400 when priceId is missing', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_1' });
    (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });

    const res = await POST(makeRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Price ID is required');
  });

  it('returns 400 when priceId is not in the allowed list', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_1' });
    (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });

    const res = await POST(makeRequest({ priceId: 'price_malicious' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Invalid price ID');
  });

  it('returns 404 when user does not exist in our DB', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_missing' });
    (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest({ priceId: validPriceId }));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe('User not found');
  });

  it('creates a Stripe customer on first checkout and persists stripeId', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_new' });
    (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u_new',
      clerkId: 'clerk_new',
      email: 'first@example.com',
      stripeId: null,
    });
    customersCreateMock.mockResolvedValue({ id: 'cus_first' });
    sessionsCreateMock.mockResolvedValue({ id: 'cs_first', url: 'https://stripe.test/cs_first' });

    const res = await POST(makeRequest({ priceId: validPriceId }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe('https://stripe.test/cs_first');
    expect(customersCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'first@example.com',
        metadata: expect.objectContaining({ clerkId: 'clerk_new', userId: 'u_new' }),
      })
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { clerkId: 'clerk_new' },
      data: { stripeId: 'cus_first' },
    });
    expect(sessionsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        customer: 'cus_first',
        line_items: [{ price: validPriceId, quantity: 1 }],
      })
    );
  });

  it('reuses existing stripeId on subsequent checkouts', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_repeat' });
    (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u_repeat',
      clerkId: 'clerk_repeat',
      email: 'returning@example.com',
      stripeId: 'cus_existing',
    });
    sessionsCreateMock.mockResolvedValue({
      id: 'cs_repeat',
      url: 'https://stripe.test/cs_repeat',
    });

    const res = await POST(makeRequest({ priceId: validPriceId }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe('https://stripe.test/cs_repeat');
    expect(customersCreateMock).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(sessionsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existing' })
    );
  });

  it('returns 500 when Stripe checkout session creation fails', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_err' });
    (checkoutRateLimit.limit as jest.Mock).mockResolvedValue({ success: true });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u_err',
      clerkId: 'clerk_err',
      email: 'err@example.com',
      stripeId: 'cus_err',
    });
    sessionsCreateMock.mockRejectedValue(new Error('Stripe API down'));

    const res = await POST(makeRequest({ priceId: validPriceId }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBeDefined();
  });
});

describe('GET /api/stripe/checkout', () => {
  it('returns 405 Method Not Allowed', async () => {
    const res = await GET();
    expect(res.status).toBe(405);
  });
});
