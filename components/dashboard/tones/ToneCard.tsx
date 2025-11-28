import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tone } from '@prisma/client';
import { Guitar, Music2 } from 'lucide-react';

export default function ToneCard({ tone }: { tone: Tone }) {
  return (
    <Card className="group hover:border-primary/20 cursor-pointer transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="group-hover:text-primary text-lg transition-colors">
              {tone.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">{tone.description}</CardDescription>
          </div>
          <div className="bg-secondary shrink-0 rounded-lg p-2.5">
            <Music2 className="text-primary h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Guitar className="h-4 w-4" />
            <span>{tone.guitar}</span>
          </div>
          <span>•</span>
          <span>{tone.artist}</span>
        </div>
      </CardContent>
    </Card>
  );
}
