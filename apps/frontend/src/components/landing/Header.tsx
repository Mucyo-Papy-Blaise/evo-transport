"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { containerPadding } from "@/lib/constants/layout";
import { cn } from "@/utils/utils";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  User,
  LogOut,
  Home,
  Map,
  HelpCircle,
  Navigation,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/types/enum";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Home", id: "home", icon: Home },
  { href: "#map-booking", label: "Map", id: "map-booking", icon: Map },
  {
    href: "#why-choose-us",
    label: "Why Us",
    id: "why-choose-us",
    icon: HelpCircle,
  },
  {
    href: "#track-booking",
    label: "Track Booking",
    id: "track-booking",
    icon: Navigation,
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth() as any;
  const dashboardHref =
    user?.role === UserRole.ADMIN ? "/admin/dashboard" : "/dashboard";

  // ── Scroll detection ────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Active section via IntersectionObserver ──────────────────────────────
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => l.id).filter((id) => id !== "home");
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.35 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    // Default to "home" when nothing else intersects
    const topObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActiveSection("home");
      },
      { threshold: 0.1 },
    );
    const heroEl =
      document.getElementById("home") || document.querySelector("section");
    if (heroEl) topObs.observe(heroEl);
    observers.push(topObs);

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // ── Close mobile menu on resize ─────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Lock body scroll when mobile menu is open ───────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback((id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
  }, []);

  const initials = user
    ? (
        (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")
      ).toUpperCase() || user.email?.[0]?.toUpperCase()
    : "";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-5",
          scrolled
            ? "bg-primary backdrop-blur-xl shadow-sm border-b border-border py-1 md:py-5"
            : "bg-transparent",
        )}
      >
        <div className={`mx-auto max-w-7xl ${containerPadding.default}`}>
          <div className="flex h-16 items-center justify-between gap-4">
            {/* ── Logo ── */}
            <Link
              href="/"
              onClick={() => handleNavClick("home")}
              className="relative shrink-0 group"
            >
              <Image
                src="/eco-logo-nobg.png"
                alt="EVO Transport"
                width={72}
                height={36}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => handleNavClick(link.id)}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                      "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      scrolled
                        ? isActive
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                        : isActive
                          ? "text-white"
                          : "text-white/75 hover:text-white",
                    )}
                  >
                    {/* Active pill */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className={cn(
                          "absolute inset-0 rounded-full",
                          scrolled ? "bg-primary/10" : "bg-white/15",
                        )}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative">{link.label}</span>

                    {/* Active dot */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className={cn(
                          "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                          scrolled ? "bg-primary" : "bg-white",
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Desktop right ── */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={cn(
                      "flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full",
                      "transition-all duration-200 outline-none",
                      "focus-visible:ring-2 focus-visible:ring-primary/50",
                      scrolled
                        ? "bg-muted hover:bg-muted/80 border border-border"
                        : "bg-white/15 hover:bg-white/25 border border-white/20",
                    )}
                  >
                    {/* Avatar */}
                    <span
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        scrolled
                          ? "bg-primary text-primary-foreground"
                          : "bg-white text-primary",
                      )}
                    >
                      {initials}
                    </span>
                    <div className="text-left leading-tight min-w-0">
                      <p
                        className={cn(
                          "text-xs font-semibold truncate max-w-28",
                          scrolled ? "text-foreground" : "text-white",
                        )}
                      >
                        {user.firstName || user.email?.split("@")[0]}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                        userMenuOpen && "rotate-180",
                        scrolled ? "text-muted-foreground" : "text-white/70",
                      )}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 top-full mt-2 w-52 z-20
                                     bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
                        >
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {user.fullName ||
                                `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                                "User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>

                          {/* Links */}
                          {[
                            {
                              href: dashboardHref,
                              label: "Dashboard",
                              icon: LayoutDashboard,
                            },
                            // { href: "/profile", label: "Profile", icon: User },
                          ].map(({ href, label, icon: Icon }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground
                                         hover:bg-muted transition-colors"
                            >
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              {label}
                            </Link>
                          ))}

                          <div className="border-t border-border" />
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout?.();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                       text-destructive hover:bg-destructive/5 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                    scrolled
                      ? "bg-[#7fe284] text-black hover:bg-[#7fe284]/60 shadow-sm"
                      : "bg-white text-black hover:bg-white/90 shadow-md",
                  )}
                >
                  Login
                </Link>
              )}
            </div>

            {/* ── Mobile burger ── */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className={cn(
                "md:hidden p-2 rounded-lg transition-all duration-200",
                scrolled
                  ? "text-foreground hover:bg-muted"
                  : "text-white hover:bg-white/15",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile full-screen menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background
                         shadow-2xl md:hidden flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <Image
                  src="/eco-logo-nobg.png"
                  alt="EVO Transport"
                  width={60}
                  height={30}
                  className="object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_LINKS.map((link, i) => {
                  const isActive = activeSection === link.id;
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => handleNavClick(link.id)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        {link.label}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* User section */}
              <div className="border-t border-border px-3 py-4">
                {user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-1"
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl mb-2">
                      <span
                        className="w-9 h-9 rounded-full bg-primary text-primary-foreground
                                       flex items-center justify-center text-sm font-bold shrink-0"
                      >
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.fullName ||
                            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                            "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {[
                      {
                        href: dashboardHref,
                        label: "Dashboard",
                        icon: LayoutDashboard,
                      },
                      // { href: "/profile", label: "Profile", icon: User },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                   text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        {label}
                      </Link>
                    ))}

                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                 text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Logout
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full py-3 rounded-xl
                                 bg-primary text-primary-foreground text-sm font-semibold
                                 hover:bg-primary/90 transition-colors"
                    >
                      Login
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
