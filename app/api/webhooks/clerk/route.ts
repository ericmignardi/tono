import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in .env');
    return new NextResponse('Webhook secret missing', { status: 500 });
  }

  const headerList = await headers();

  const svixHeaders = {
    'svix-id': headerList.get('svix-id') ?? '',
    'svix-timestamp': headerList.get('svix-timestamp') ?? '',
    'svix-signature': headerList.get('svix-signature') ?? '',
  };

  const payload = await req.text();
  const webhook = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;

  try {
    event = webhook.verify(payload, svixHeaders) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const { type, data } = event;

  console.log(`Clerk webhook event: ${type}`);

  switch (type) {
    case 'user.created': {
      const email = data.email_addresses?.[0]?.email_address ?? null;
      const firstName = data.first_name ?? null;
      const lastName = data.last_name ?? null;

      await prisma.user.upsert({
        where: { clerkId: data.id },
        update: {
          email: email ?? undefined,
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
        },
        create: {
          clerkId: data.id,
          email,
          firstName,
          lastName,
        },
      });

      break;
    }

    case 'user.updated': {
      const email = data.email_addresses?.[0]?.email_address ?? null;
      const firstName = data.first_name ?? null;
      const lastName = data.last_name ?? null;

      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          email: email ?? undefined,
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
        },
      });

      break;
    }

    case 'user.deleted': {
      await prisma.user.delete({
        where: { clerkId: data.id },
      });
      break;
    }

    default:
      console.log(`Unhandled event type: ${type}`);
  }

  return NextResponse.json({ success: true });
}
