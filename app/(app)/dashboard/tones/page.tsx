import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import ToneCard from '@/components/dashboard/tones/ToneCard';
import { redirect } from 'next/navigation';

export default async function Tones() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  const tones = await prisma.tone.findMany({
    where: { userId: dbUser?.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <section>
      <h1>Tones</h1>
      {tones.length === 0 ? (
        <p>No tones yet. Create your first one!</p>
      ) : (
        <div>
          {tones.map((tone) => (
            <ToneCard key={tone.id} tone={tone} />
          ))}
        </div>
      )}
    </section>
  );
}
