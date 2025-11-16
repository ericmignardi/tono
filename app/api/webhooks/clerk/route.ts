import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import { config } from '@/lib/config';

export async function POST(req: Request) {
  if (!config.CLERK_WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in .env');
    return new NextResponse('Webhook secret missing', { status: 500 });
  }

  const headerList = await headers();
  const svixHeaders = {
    'svix-id': headerList.get('svix-id') ?? '',
    'svix-timestamp': headerList.get('svix-timestamp') ?? '',
    'svix-signature': headerList.get('svix-signature') ?? '',
  };

  // Validate required headers
  if (!svixHeaders['svix-id'] || !svixHeaders['svix-timestamp'] || !svixHeaders['svix-signature']) {
    console.error('Missing required svix headers');
    return new NextResponse('Missing required headers', { status: 400 });
  }

  const payload = await req.text();
  const webhook = new Webhook(config.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent;

  try {
    event = webhook.verify(payload, svixHeaders) as WebhookEvent;
  } catch (err) {
    console.error('Clerk webhook verification failed:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const { type, data } = event;
  console.log(`Clerk webhook event: ${type} (ID: ${data.id})`);

  try {
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

        console.log(`User created/updated: ${data.id} (${email})`);
        break;
      }

      case 'user.updated': {
        const email = data.email_addresses?.[0]?.email_address ?? null;
        const firstName = data.first_name ?? null;
        const lastName = data.last_name ?? null;

        // Check if user exists before updating
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: data.id },
        });

        if (!existingUser) {
          console.warn(`User ${data.id} not found for update, creating instead`);
          await prisma.user.create({
            data: {
              clerkId: data.id,
              email,
              firstName,
              lastName,
            },
          });
        } else {
          await prisma.user.update({
            where: { clerkId: data.id },
            data: {
              email: email ?? undefined,
              firstName: firstName ?? undefined,
              lastName: lastName ?? undefined,
            },
          });
        }

        console.log(`User updated: ${data.id} (${email})`);
        break;
      }

      case 'user.deleted': {
        // Check if user exists before deleting
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: data.id },
        });

        if (existingUser) {
          // Delete user and all related data (cascading deletes should handle related records)
          await prisma.user.delete({
            where: { clerkId: data.id },
          });
          console.log(`User deleted: ${data.id}`);
        } else {
          console.warn(`User ${data.id} not found for deletion`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error processing Clerk webhook ${type}:`, error);
    return new NextResponse(
      JSON.stringify({
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Reject other methods
export async function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
