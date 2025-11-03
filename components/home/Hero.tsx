import { Button } from '@/components/ui/button';
import { SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Hero() {
  return (
    <section id="hero" className="flex flex-col items-center justify-center gap-4 py-24">
      <h1 className="text-5xl font-black">Find Any Guitar Tone, Instantly.</h1>
      <p>
        Use AI to recreate the signature sounds of your favourite artists or craft your own unique
        tone
      </p>
      <div className="flex items-center gap-3">
        <Link href="/sign-up">
          <Button>Create Your Tone For Free</Button>
        </Link>
        <SignedOut>
          <SignInButton>
            <Button variant={'outline'}>Sign in</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </section>
  );
}
