import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto bg-slate-50/50">{children}</div>
      </main>
    </div>
  );
}
