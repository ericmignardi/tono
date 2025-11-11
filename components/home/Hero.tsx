import { Button } from '@/components/ui/button';
import { SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Hero() {
  return (
    <section id="hero" className="heroSection">
      <h1 className="text-5xl font-bold lg:text-6xl">
        Find Any Guitar <br />
        <span className="text-primary">Tone</span>, Instantly.
      </h1>
      <p className="text-muted-foreground text-lg">
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
