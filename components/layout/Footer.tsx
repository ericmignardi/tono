import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  const socialLinks = [
    { href: '', Icon: Facebook },
    { href: '', Icon: Instagram },
    { href: '', Icon: Twitter },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="flex items-center justify-between p-4 text-sm">
        <div className="flex items-center">&copy; {year} tono. All rights reserved.</div>
        <div className="flex items-center gap-4">
          {socialLinks.map(({ href, Icon }, idx) => (
            <Link key={idx} href={href}>
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
