"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchProvider } from "@/contexts/SearchContext";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/types/enum";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!user) {
      router.replace("/login?next=/dashboard");
      return;
    }
    if (user.role === UserRole.ADMIN) {
      router.replace("/admin/dashboard");
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading || !user || user.role === UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SearchProvider>
      <div className="min-h-screen bg-muted">
        <DashboardSidebar />
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <DashboardTopbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SearchProvider>
  );
}
