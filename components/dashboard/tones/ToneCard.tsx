import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tone } from '@prisma/client';

export default function ToneCard({ tone }: { tone: Tone }) {
  return (
    <Card className="flex flex-col gap-0 shadow-md transition-transform hover:-translate-y-1">
      <CardHeader>
        <CardTitle>{tone.name}</CardTitle>
        <CardDescription>{tone.description}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
