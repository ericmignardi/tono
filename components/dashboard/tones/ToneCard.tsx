import { Tone } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ToneCardProps = {
  tone: Tone;
};

export default function ToneCard({ tone }: ToneCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tone.name}</CardTitle>
        {tone.description && <CardDescription>{tone.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div>Created {new Date(tone.createdAt).toLocaleDateString()}</div>
      </CardContent>
    </Card>
  );
}
