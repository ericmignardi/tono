import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background fixed right-0 bottom-0 left-0 w-full border-t">
      <div className="text-muted-foreground mx-auto flex max-w-7xl items-center justify-end p-4 text-sm">
        <Link href="https://github.com/ericmignardi/tono">
          <Github className="h-8 w-8" />
        </Link>
      </div>
    </footer>
  );
}
