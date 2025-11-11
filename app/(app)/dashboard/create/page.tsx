import ToneForm from '@/components/dashboard/create-tones/ToneForm';
import { Badge } from '@/components/ui/badge';

export default function CreateTone() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Badge variant={'outline'}>AI-Powered</Badge>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Create Tone</h1>
        <p className="text-muted-foreground">Create your own personalized tones.</p>
      </div>
      <ToneForm />
    </section>
  );
}
