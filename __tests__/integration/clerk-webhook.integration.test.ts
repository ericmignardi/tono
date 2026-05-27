/**
 * @jest-environment node
 */

jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const verifyMock = jest.fn();
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({ verify: verifyMock })),
}));

const mockedHeaderStore: { current: Record<string, string> } = { current: {} };
jest.mock('next/headers', () => ({
  headers: jest.fn(async () => ({
    get: (key: string) => mockedHeaderStore.current[key.toLowerCase()] ?? null,
  })),
}));

import { POST, GET } from '@/app/api/webhooks/clerk/route';
import { prisma } from '@/lib/prisma/database';

function makeRequest(
  body: string,
  headerValues: Record<string, string> = {
    'svix-id': 'msg_1',
    'svix-timestamp': '1700000000',
    'svix-signature': 'v1,test',
  }
): Request {
  mockedHeaderStore.current = Object.fromEntries(
    Object.entries(headerValues).map(([k, v]) => [k.toLowerCase(), v])
  );
  return new Request('http://localhost/api/webhooks/clerk', {
    method: 'POST',
    body,
    headers: headerValues,
  });
}

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when required svix headers are missing', async () => {
    const res = await POST(makeRequest('{}', {}));

    expect(res.status).toBe(400);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('returns 400 when signature verification fails', async () => {
    verifyMock.mockImplementation(() => {
      throw new Error('bad signature');
    });

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(400);
    expect(await res.text()).toMatch(/Invalid signature/);
  });

  it('handles user.created: upserts a user row', async () => {
    verifyMock.mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_new',
        email_addresses: [{ email_address: 'new@example.com' }],
        first_name: 'New',
        last_name: 'User',
      },
    });
    (prisma.user.upsert as jest.Mock).mockResolvedValue({});

    const res = await POST(makeRequest('{}'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'user_new' },
        create: expect.objectContaining({
          clerkId: 'user_new',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
        }),
      })
    );
  });

  it('handles user.created with no email address gracefully', async () => {
    verifyMock.mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_no_email',
        email_addresses: [],
        first_name: null,
        last_name: null,
      },
    });
    (prisma.user.upsert as jest.Mock).mockResolvedValue({});

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          clerkId: 'user_no_email',
          email: null,
        }),
      })
    );
  });

  it('handles user.updated for an existing user', async () => {
    verifyMock.mockReturnValue({
      type: 'user.updated',
      data: {
        id: 'user_existing',
        email_addresses: [{ email_address: 'updated@example.com' }],
        first_name: 'Updated',
        last_name: 'Person',
      },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'db_1' });
    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('user.updated creates the row when user does not yet exist', async () => {
    verifyMock.mockReturnValue({
      type: 'user.updated',
      data: {
        id: 'user_orphan',
        email_addresses: [{ email_address: 'orphan@example.com' }],
        first_name: 'Orphan',
        last_name: 'Account',
      },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clerkId: 'user_orphan',
        email: 'orphan@example.com',
      }),
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('handles user.deleted', async () => {
    verifyMock.mockReturnValue({
      type: 'user.deleted',
      data: { id: 'user_gone' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'db_2' });
    (prisma.user.delete as jest.Mock).mockResolvedValue({});

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { clerkId: 'user_gone' },
    });
  });

  it('user.deleted is a no-op when user does not exist', async () => {
    verifyMock.mockReturnValue({
      type: 'user.deleted',
      data: { id: 'user_ghost' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('returns 200 for unhandled event types without touching the DB', async () => {
    verifyMock.mockReturnValue({
      type: 'session.created',
      data: { id: 'sess_1' },
    });

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(200);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('returns 500 if database operation throws', async () => {
    verifyMock.mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_db_fail',
        email_addresses: [{ email_address: 'fail@example.com' }],
        first_name: null,
        last_name: null,
      },
    });
    (prisma.user.upsert as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await POST(makeRequest('{}'));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe('Webhook processing failed');
  });
});

describe('GET /api/webhooks/clerk', () => {
  it('returns 405 Method Not Allowed', async () => {
    const res = await GET();
    expect(res.status).toBe(405);
  });
});
