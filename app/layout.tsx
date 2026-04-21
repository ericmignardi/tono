import type { Metadata } from 'next';
import { Syne, Manrope } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
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
        <body className={`${syne.variable} ${manrope.variable} font-sans antialiased`}>
          <Providers>{children}</Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
