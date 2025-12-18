'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import { unstable_cache } from 'next/cache';

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

  // Use Next.js cache with a tag so we can revalidate it
  const getCachedCount = unstable_cache(
    async (userId: string) => {
      return await prisma.tone.count({
        where: { userId },
      });
    },
    ['tone-count', dbUser.id],
    {
      revalidate: 10, // Revalidate every 10 seconds
      tags: [`user-${dbUser.id}-tones`],
    }
  );

  return getCachedCount(dbUser.id);
}
