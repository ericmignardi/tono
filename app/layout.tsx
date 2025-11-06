import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${robotoSans.variable} ${robotoSans.className} antialiased`}>
          <div className="flex min-h-screen flex-col">
            {!isSignedIn && <Header />}
            <main className="flex-1">{children}</main>
            {!isSignedIn && <Footer />}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
