'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';

export async function getToneCount(): Promise<number> {
  const { userId } = await auth();

  if (!userId) {
    return 0;
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!dbUser) {
    return 0;
  }

  const count = await prisma.tone.count({
    where: { userId: dbUser.id },
  });

  return count;
}
