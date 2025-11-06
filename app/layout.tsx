import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const robotoSans = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'tonifier – find any guitar tone, instantly',
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
      <html lang="en">
        <body className={`${robotoSans.variable} ${robotoSans.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
