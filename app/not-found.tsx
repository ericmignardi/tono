import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-9xl font-bold text-neutral-800">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
          <p className="text-neutral-400">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't
            exist.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="default">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
