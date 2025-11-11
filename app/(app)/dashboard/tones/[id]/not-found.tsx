import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <section>
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl font-bold">Tone not found</h2>
        <p className="text-muted-foreground">The tone you're looking for doesn't exist.</p>
        <Link href="/dashboard/tones">
          <Button variant="outline">
            <ArrowLeft />
            <span>Back to tones</span>
          </Button>
        </Link>
      </div>
    </section>
  );
}
