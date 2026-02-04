import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: {
    default: 'tono | AI Amp Settings Generator',
    template: 'tono | %s',
  },
  description:
    'Generate precise guitar amp settings with AI. Describe your dream tone or upload reference audio (Pro) for precision matching. Create, save, and share your perfect sound.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${montserrat.variable} antialiased`}>
          <Providers>{children}</Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
