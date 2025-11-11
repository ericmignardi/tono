import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/database';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Guitar, Zap, Settings, ArrowLeft, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function Tone({ params }: { params: Promise<{ id: string }> }) {
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
    where: { userId: dbUser?.id, id: id },
  });

  if (!tone) {
    return notFound();
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Tones</h1>
            <p className="text-muted-foreground">View your personal library of tones.</p>
          </div>
          <div>
            <Link href={`/dashboard/tones/${id}/edit`}>
              <Button>Edit Tone</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Gear Setup Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Guitar className="text-primary" />
                Gear
              </CardTitle>
              <CardDescription>The equipment used for this tone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <div>
                    <label className="text-muted-foreground text-xs font-medium uppercase">
                      Guitar
                    </label>
                    <p className="text-sm font-medium">{tone.guitar}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs font-medium uppercase">
                      Pickups
                    </label>
                    <p className="text-sm font-medium">{tone.pickups}</p>
                  </div>
                </div>
                <div>
                  <div>
                    <label className="text-muted-foreground text-xs font-medium uppercase">
                      Strings
                    </label>
                    <p className="text-sm font-medium">{tone.strings || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs font-medium uppercase">
                      Amp
                    </label>
                    <p className="text-sm font-medium">{tone.amp}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Amp Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="text-primary" />
                Amp Settings
              </CardTitle>
              <CardDescription>AI-recommended amplifier configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Object.entries(tone.aiAmpSettings as Record<string, any>).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-muted-foreground text-xs font-medium uppercase">
                      {key}
                    </label>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          {/* AI Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="text-primary" />
                AI Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{tone.aiNotes}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
