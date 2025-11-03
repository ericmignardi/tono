import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="border-b-border border-b">
      <div className="flex items-center justify-between p-4">
        <Link href="/">
          <h1 className="text-xl font-bold italic">tonifier</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/#features" className="text-foreground/80 hover:text-foreground text-sm">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-foreground/80 hover:text-foreground text-sm">
            How it works
          </Link>
          <Link href="/#testimonials" className="text-foreground/80 hover:text-foreground text-sm">
            Testimonials
          </Link>
          <SignedOut>
            <SignInButton>
              <Button variant="ghost">Sign in</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
