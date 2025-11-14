import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import ToneCard from '@/components/dashboard/tones/ToneCard';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    <section className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Tones</h1>
          <p className="text-muted-foreground">View your personal library of tones.</p>
        </div>
        <div>
          <Link href="/dashboard/create-tone">
            <Button variant={'outline'} className="cursor-pointer">
              Create Tone
            </Button>
          </Link>
        </div>
      </div>
      <div>
        {tones.length === 0 ? (
          <p>No tones yet. Create your first one!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tones.map((tone) => (
              <Link key={tone.id} href={`/dashboard/tones/${tone.id}`}>
                <ToneCard tone={tone} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
