import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import ToneCard from '@/components/dashboard/tones/ToneCard';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Music2 } from 'lucide-react';

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
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tones</h1>
          <p className="text-slate-500">View and manage your personal library of tones</p>
        </div>
        <Link href="/dashboard/create">
          <Button>
            <Plus className="h-4 w-4" />
            Create Tone
          </Button>
        </Link>
      </div>

      {/* Tones Grid */}
      {tones.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-slate-200 py-16 text-center">
          <div className="bg-secondary rounded-full p-4">
            <Music2 className="text-primary h-8 w-8" />
          </div>
          <div>
            <p className="font-medium text-slate-900">No tones yet</p>
            <p className="text-sm text-slate-500">Create your first tone to get started</p>
          </div>
          <Link href="/dashboard/create">
            <Button>
              <Plus className="h-4 w-4" />
              Create Tone
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tones.map((tone) => (
            <Link key={tone.id} href={`/dashboard/tones/${tone.id}`}>
              <ToneCard tone={tone} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
