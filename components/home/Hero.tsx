import { Button } from '@/components/ui/button';
import { SignedOut, SignUpButton } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import hero from '@/public/hero.png';
import Image from 'next/image';

export default function Hero() {
  return (
    <section
      id="hero"
      className="from-background via-background to-primary/50 min-h-screen place-content-center bg-linear-to-tr"
    >
      <div className="flex flex-col items-center justify-center gap-16 p-8 lg:p-32">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Badge variant={'outline'}>Powered by OpenAI</Badge>
          <h1 className="text-5xl font-bold lg:text-6xl">
            Find Any Guitar Tone, <br /> Instantly.
          </h1>
          <p className="text-lg">
            Use AI to recreate the signature sounds of your favourite artists or craft your own
            unique tone
          </p>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignUpButton>
                <Button className="cursor-pointer">Get started</Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
        <div>
          <Image
            className="w-full rounded-2xl border shadow-2xl"
            src={hero}
            alt="Tone dashboard page screenshot"
          />
        </div>
      </div>
    </section>
  );
}
