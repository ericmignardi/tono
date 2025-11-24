import { prisma } from '@/lib/prisma/database';
import { Prisma } from '@prisma/client';

export async function cleanDatabase() {
  await prisma.tone.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.webhookEvent.deleteMany();
}

export async function createTestUser(overrides?: Partial<Prisma.UserCreateInput>) {
  return prisma.user.create({
    data: {
      clerkId: `test_clerk_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      generationsUsed: 0,
      generationsLimit: 5,
      ...overrides,
    },
  });
}

export async function createTestTone(
  userId: string,
  overrides?: Partial<Prisma.ToneUncheckedCreateInput>
) {
  return prisma.tone.create({
    data: {
      userId,
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'Test Description',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: '.010–.046',
      amp: 'Test Amp',
      aiAmpSettings: {
        gain: 5,
        treble: 5,
        mid: 5,
        bass: 5,
        volume: 5,
        presence: 5,
        reverb: 3,
      },
      aiNotes: 'Test notes',
      ...overrides,
    },
  });
}
