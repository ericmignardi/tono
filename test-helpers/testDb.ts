import { prisma } from '@/lib/prisma/database';
import { Prisma } from '@prisma/client';

export async function cleanDatabase() {
  // Delete in order of dependencies (child tables first)
  await prisma.$transaction([
    prisma.tone.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.webhookEvent.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function createTestUser(overrides?: Partial<Prisma.UserCreateInput>) {
  const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  return prisma.user.create({
    data: {
      clerkId: `test_clerk_${uniqueId}`,
      email: `test${uniqueId}@example.com`,
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
