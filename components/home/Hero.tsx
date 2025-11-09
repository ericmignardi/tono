import { Button } from '@/components/ui/button';
import { SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Hero() {
  return (
    <section
      id="hero"
      className="flex flex-1 flex-col items-start justify-center gap-4 py-64 lg:items-center"
    >
      <h1 className="text-7xl font-black">
        Find Any Guitar <br />
        <span className="from-accent via-foreground to-primary bg-linear-to-r bg-clip-text text-transparent shadow-2xl">
          Tone
        </span>
        , Instantly.
      </h1>
      <p className="text-muted-foreground">
        Use AI to recreate the signature sounds of your favourite artists or craft your own unique
        tone
      </p>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignUpButton>
            <Button>Get started</Button>
          </SignUpButton>
          <SignInButton>
            <Button variant={'outline'}>Sign in</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </section>
  );
}
