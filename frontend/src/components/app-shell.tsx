'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { TopHeader } from '@/components/top-header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-full bg-[#F4F7FB]">
      <Sidebar />
      <div className="ml-20 min-h-screen md:ml-72">
        <TopHeader />
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
