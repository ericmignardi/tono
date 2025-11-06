import { SignedIn, UserButton } from '@clerk/nextjs';

// TODO: Implement additional features or routes

export default function Header() {
  return (
    <header className="border-b-border sticky top-0 z-10 border-b p-4">
      <nav className="flex items-center justify-end">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
