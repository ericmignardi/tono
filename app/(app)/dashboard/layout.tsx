import type { Metadata } from 'next';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        <Header />
        <div className="bg-muted/50 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
