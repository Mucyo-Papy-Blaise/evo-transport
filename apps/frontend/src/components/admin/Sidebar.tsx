"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/utils/utils";
import Image from "next/image";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  { label: "Booking", href: "/admin/bookings", icon: BookOpen, active: true },
  // {
  //   label: "Next Services",
  //   href: "/admin/next-services",
  //   icon: CalendarClock,
  //   active: false,
  // },
  // {
  //   label: "Transfer Schedule",
  //   href: "/admin/transfer-schedule",
  //   icon: ArrowLeftRight,
  //   active: false,
  // },
  // {
  //   label: "Service Schedule",
  //   href: "/admin/service-schedule",
  //   icon: CalendarDays,
  //   active: false,
  // },
  // {
  //   label: "Parking Space Overview",
  //   href: "/admin/parking-overview",
  //   icon: ParkingSquare,
  //   active: false,
  // },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    active: true,
  },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Link
              href="/"
              className="relative shrink-0 group"
            >
              <Image
                src="/eco-logo.png"
                alt="EVO Transport"
                width={72}
                height={36}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const isDisabled = !item.active;

          return (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              onClick={isDisabled ? undefined : onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : isDisabled
                    ? "text-muted-foreground/40 cursor-not-allowed pointer-events-none"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-disabled={isDisabled}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-primary" : "",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border shrink-0">
        <p className="text-xs text-muted-foreground text-center">
          Admin Panel v1.0
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    const timer = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    }, 0);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile hamburger (top-left, only on small screens) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-40 w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
        aria-label="Open sidebar"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* ── Desktop: fixed sidebar ── */}
      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 z-30 bg-card border-r border-border flex-col">
        <SidebarContent />
      </aside>

      {/* ── Mobile: backdrop overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col",
          "transition-transform duration-300 ease-in-out shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
