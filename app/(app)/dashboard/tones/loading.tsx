import { Loader } from 'lucide-react';

export default function Loading() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Tones</h1>
        <p className="text-muted-foreground">View all your tones.</p>
      </div>
      <div>
        <Loader className="text-muted-foreground animate-spin" />
      </div>
    </section>
  );
}
