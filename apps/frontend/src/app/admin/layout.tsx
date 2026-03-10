'use client';

import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/TopBar';
import { SearchProvider } from '@/contexts/SearchContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-muted">
        <Sidebar />
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <Topbar placeholder="Search by booking ID, customer name, or email..." />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}