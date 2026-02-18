import { prisma } from '@/lib/prisma/database';

/**
 * Checks if a user's credits should be reset for a new billing period.
 * Uses a "check-on-use" pattern: rather than a cron job, we reset credits
 * lazily the first time a user generates a tone in a new month.
 *
 * @returns true if credits were reset, false otherwise
 */
export async function resetCreditsIfNewPeriod(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastResetDate: true },
  });

  if (!user) return false;

  const now = new Date();
  const lastReset = user.lastResetDate ? new Date(user.lastResetDate) : null;

  // Reset if no previous reset, or if we've entered a new calendar month
  const shouldReset =
    !lastReset ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (shouldReset) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        generationsUsed: 0,
        lastResetDate: now,
      },
    });
    console.log(`Credits reset for user ${userId} (new billing period)`);
    return true;
  }

  return false;
}
