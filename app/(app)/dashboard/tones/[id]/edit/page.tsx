import { prisma } from '@/lib/prisma/database';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ToneForm from '@/components/dashboard/create-tones/ToneForm';

export default async function EditTonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  const tone = await prisma.tone.findUnique({
    where: { id: id, userId: dbUser?.id },
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Edit Tone</h1>
        <p className="text-muted-foreground">Edit your personalized tone settings.</p>
      </div>
      <ToneForm tone={tone} />
    </section>
  );
}
