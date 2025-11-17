import type { Metadata } from 'next';
import { Vend_Sans } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const vendSans = Vend_Sans({
  variable: '--font-vend',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'tono – Find Any Guitar Tone, Instantly.',
  description:
    'Use AI to recreate signature guitar tones or craft your own. Generate, tweak, and save tones in seconds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${vendSans.variable} ${vendSans.className} font-sans antialiased`}>
          <Providers>{children}</Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
