"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/lib/auth/auth-context";

export function UserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push("/login");
  };

//   const initials = user
//     ? `${user.fullName?.[0] ?? ""}`.toUpperCase()
//     : "A";

  const menuItems = [
    {
      icon: User,
      label: "My Profile",
      onClick: () => {
        setOpen(false);
        router.push("/admin/profile");
      },
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        setOpen(false);
        router.push("/admin/settings");
      },
    },
  ];

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2.5 h-9 pl-1 pr-2.5 rounded-xl border transition-all duration-150",
          open
            ? "border-primary bg-muted"
            : "border-transparent hover:border-border hover:bg-muted",
        )}
      >
        {/* Avatar */}
        {/* <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {user?.profilePicture ? (
            <Image
              src={user.profilePicture}
              alt={user.fullName}
              width={28}
              height={28}
              className="object-cover"
            />
          ) : (
            <span className="text-[11px] font-bold text-secondary-foreground">
              {initials}
            </span>
          )}
        </div> */}

        {/* Name + role */}
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-xs font-semibold text-foreground">
            {user?.fullName ?? "Admin"}
          </p>
          <p className="text-[10px] text-muted-foreground capitalize">
            {user?.role?.toLowerCase() ?? "admin"}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3.5 border-b border-border">
            <p className="text-sm font-semibold text-secondary truncate">
              {user?.fullName ?? "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email ?? ""}
            </p>
            <span className="mt-1.5 inline-block text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
              {user?.role?.toLowerCase() ?? "admin"}
            </span>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className="p-1.5 pt-0 border-t border-border mt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
