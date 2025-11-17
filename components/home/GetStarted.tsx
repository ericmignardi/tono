import { SignedOut, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import getStarted from '@/public/get-started.png';
import Image from 'next/image';

export default function GetStarted() {
  return (
    <section id="get-started">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center justify-center gap-16 p-8 md:grid-cols-2 lg:flex-row lg:p-32">
        <div className="flex flex-col items-center justify-center gap-4 text-center lg:items-start lg:text-left">
          <Badge variant={'outline'}>Join Today</Badge>
          <h2 className="text-4xl font-bold lg:text-5xl">Get started today for free</h2>
          <p>Immediately gain access to five generation credits for recreating your dream tones.</p>
          <SignedOut>
            <SignUpButton>
              <Button className="cursor-pointer">Get started</Button>
            </SignUpButton>
          </SignedOut>
        </div>
        <div>
          <Image
            className="w-full rounded-2xl border shadow-2xl"
            src={getStarted}
            alt="Tone detail page screenshot"
          />
        </div>
      </div>
    </section>
  );
}
