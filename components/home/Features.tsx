import { Clock, Guitar, Library, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Features() {
  const features = [
    {
      Icon: Zap,
      title: 'Instant Tone Generation',
      description:
        'Get professional amp settings in seconds. No more hours of trial and error—just input your gear and play.',
    },
    {
      Icon: Guitar,
      title: 'Gear-Specific Results',
      description:
        'Tailored settings for your exact guitar, pickups, strings, and amp. Work with what you have, not what you wish you had.',
    },
    {
      Icon: Library,
      title: 'Tone Library',
      description:
        'Save and organize all your favorite tones. Access your complete collection anytime, anywhere.',
    },
    {
      Icon: Sparkles,
      title: 'AI-Powered Intelligence',
      description:
        'Advanced AI analyzes your gear and desired sound to generate accurate, usable configurations.',
    },
    {
      Icon: RefreshCw,
      title: 'Endless Refinement',
      description:
        'Edit and regenerate tones as your gear changes. Update settings instantly without starting from scratch.',
    },
    {
      Icon: Clock,
      title: 'Stop Wasting Time',
      description:
        'Spend more time playing and less time tweaking. Get back to what matters—making music.',
    },
  ];

  return (
    <section id="features">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-16 p-8 lg:p-32">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Badge variant={'outline'}>Our Features</Badge>
          <h2 className="text-4xl font-bold lg:text-5xl">
            Everything a guitarist needs <br /> in one place
          </h2>
          <p>All-in-one solution for tone management.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, description }, index) => (
            <Card
              key={title}
              className="first:border-primary first:from-background first:via-background first:to-primary/50 flex flex-col justify-between first:bg-linear-to-tr"
            >
              <CardHeader>
                <Icon className="h-6 w-6" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="text-base">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
