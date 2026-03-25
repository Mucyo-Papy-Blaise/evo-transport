"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PasswordField } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/auth-context";
import { loginSchema, type LoginInput } from "@/types";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { ZodError } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleRedirects: Record<string, string> = {
    ADMIN: "/admin/dashboard",
    PASSENGER: "/dashboard",
    DRIVER: "/dashboard",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = e.currentTarget;
      const raw: LoginInput = {
        email: (form.elements.namedItem("email") as HTMLInputElement).value,
        password: (form.elements.namedItem("password") as HTMLInputElement)
          .value,
      };

      const parsed = loginSchema.parse(raw);
      const { user } = await login(parsed);

      const destination = roleRedirects[user.role] ?? "/dashboard";
      router.push(destination);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map((e) => e.message).join(", "));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-secondary">
      <div className="absolute inset-0 z-0">
        <Image
          src="/tripLogin.jpg"
          alt="background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/60" />
      </div>

      {/* ── Left side brand text (visible on md+) ── */}
      <div className="relative z-10 hidden md:flex flex-col justify-end flex-1 h-screen p-12 pb-16">
        <span className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            {/* Bus Icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="11" rx="2" />
              <path d="M7 16v3M17 16v3" />
              <circle cx="7.5" cy="19.5" r="1.5" />
              <circle cx="16.5" cy="19.5" r="1.5" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">
            Evo Transport
          </span>
        </span>

        <h1 className="text-white text-5xl font-bold leading-tight mb-4 max-w-md">
          Book buses
          <br />
          Match your trips
        </h1>

        <p className="text-white/70 text-base max-w-xs">
          Find the best bus routes, match trips with travelers, and reach your
          destination with ease.
        </p>

        {/* Slide dots */}
        <div className="flex gap-2 mt-8">
          <div className="w-6 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* ── Right side login card ── */}
      <div className="relative z-10 flex items-center justify-center w-full md:w-auto md:min-w-130 md:max-w-140 min-h-screen md:min-h-0 px-4 py-10 md:py-0 md:mr-12">
        <div className="w-full bg-card rounded-3xl shadow-2xl px-10 py-12 w">
          {/* Logo mark on card (mobile only) */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="font-semibold text-secondary">YourBrand</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-primary text-3xl font-bold leading-tight mb-1">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <PasswordField
              name="password"
              label="Password"
              placeholder="Enter your password"
              size="lg"
              leftIcon={<Lock className="h-4 w-4" />}
              disabled={loading}
              required
            />

            {/* Remember + Forgot */}
            {/* <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot Password
              </Link>
            </div> */}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
                {error}
              </p>
            )}

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full  text-white py-3 rounded-lg font-medium cursor-pointer transition disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Login"}
            </Button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-7">
            You Don&apos;t have account?{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:text-secondary transition-colors"
            >
              Click Here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
