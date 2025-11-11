import { Tone } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ToneCardProps = {
  tone: Tone;
};

export default function ToneCard({ tone }: ToneCardProps) {
  return (
    <Card className="flex flex-col gap-0 shadow-xl transition-transform hover:-translate-y-1">
      <CardHeader>
        <CardTitle>{tone.name}</CardTitle>
        <CardDescription>{tone.description}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
