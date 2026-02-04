import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma/database';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Guitar, Settings, Brain, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { deleteTone } from '@/lib/actions/tones';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tone = await prisma.tone.findUnique({
    where: { id },
    select: { name: true, artist: true },
  });

  if (!tone) {
    return { title: 'Tone Not Found - tono' };
  }

  return {
    title: `${tone.name} by ${tone.artist} - tono`,
    description: `View guitar tone settings for ${tone.name} by ${tone.artist}`,
  };
}

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
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/tones"
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tones
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-foreground text-3xl font-bold tracking-tight">{tone.name}</h1>
            <p className="text-muted-foreground">{tone.artist}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/tones/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <form action={deleteTone}>
              <input type="hidden" name="toneId" value={id} />
              <Button variant="destructive" size="sm" type="submit">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{tone.description}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Gear Setup */}
        <div className="space-y-6 lg:col-span-2">
          {/* Gear Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Guitar className="text-primary h-5 w-5" />
                Gear Setup
              </CardTitle>
              <CardDescription>The equipment used for this tone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-medium uppercase">Guitar</label>
                  <p className="text-foreground font-medium">{tone.guitar}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-medium uppercase">Pickups</label>
                  <p className="text-foreground font-medium">{tone.pickups}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-medium uppercase">Strings</label>
                  <p className="text-foreground font-medium">{tone.strings || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-medium uppercase">Amp</label>
                  <p className="text-foreground font-medium">{tone.amp}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Amp Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="text-primary h-5 w-5" />
                AI Amp Settings
              </CardTitle>
              <CardDescription>AI-recommended amplifier configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                {Object.entries(tone.aiAmpSettings as Record<string, any>).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-muted-foreground text-xs font-medium uppercase">{key}</label>
                    <p className="text-foreground text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Notes */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-primary h-5 w-5" />
                AI Notes
              </CardTitle>
              <CardDescription>AI-generated insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{tone.aiNotes}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
