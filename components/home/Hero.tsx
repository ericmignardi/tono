import { Button } from '@/components/ui/button';
import { SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Hero() {
  return (
    <section
      id="hero"
      className="flex flex-col items-start justify-center gap-4 py-24 lg:items-center"
    >
      <h1 className="text-5xl font-black">
        Find Any Guitar{' '}
        <span className="from-accent via-foreground to-primary bg-linear-to-r bg-clip-text text-transparent uppercase italic">
          Tone
        </span>
        , Instantly.
      </h1>
      <p>
        Use AI to recreate the signature sounds of your favourite artists or craft your own unique
        tone
      </p>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignUpButton>
            <Button>Create your tone for free</Button>
          </SignUpButton>
          <SignInButton>
            <Button variant={'outline'}>Sign in</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </section>
  );
}
