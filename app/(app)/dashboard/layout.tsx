import Header from '@/components/dashboard/layout/Header';
import Sidebar from '@/components/dashboard/layout/Sidebar';
import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Sidebar - Fixed positioning */}
      <Sidebar />

      {/* Main content area - Uses margin to account for sidebar */}
      <div className="ml-16 flex h-full flex-col lg:ml-64">
        {/* Header - Sticky within the scrollable container */}
        <Header />

        {/* Main content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
