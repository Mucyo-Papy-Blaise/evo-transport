"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PasswordField } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone } from "lucide-react";
import { ZodError } from "zod";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/types";
import { useRegister } from "@/lib/auth/auth-queries";
import { UserRole } from "@/types/enum";
import { ApiError } from "@/lib/query/query-client";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      const form = e.currentTarget;
      const raw: RegisterInput = {
        email: (form.elements.namedItem("email") as HTMLInputElement).value,
        password: (form.elements.namedItem("password") as HTMLInputElement)
          .value,
        confirmPassword: (
          form.elements.namedItem("confirmPassword") as HTMLInputElement
        ).value,
        firstName: (form.elements.namedItem("firstName") as HTMLInputElement)
          .value,
        lastName: (form.elements.namedItem("lastName") as HTMLInputElement)
          .value,
        phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      };

      const parsed = registerSchema.parse(raw);
      const { user } = await register.mutateAsync({
        email: parsed.email,
        password: parsed.password,
        firstName: parsed.firstName.trim(),
        lastName: parsed.lastName.trim(),
        ...(parsed.phone?.trim() && { phone: parsed.phone.trim() }),
      });

      const dest =
        user.role === UserRole.ADMIN
          ? "/admin/dashboard"
          : user.role === UserRole.DRIVER
            ? "/dashboard"
            : "/dashboard";
      router.push(dest);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map((x) => x.message).join(", "));
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    }
  }

  const loading = register.isPending;

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

      <div className="relative z-10 hidden md:flex flex-col justify-end flex-1 h-screen p-12 pb-16">
        <span className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
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
          Your trips,
          <br />
          one account
        </h1>
        <p className="text-white/70 text-base max-w-sm">
          Register to view bookings, message our team, and get notifications —
          without booking as a guest each time.
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-center w-full md:w-auto md:min-w-130 md:max-w-140 min-h-screen md:min-h-0 px-4 py-10 md:py-0 md:mr-12">
        <div className="w-full bg-card rounded-3xl shadow-2xl px-8 py-10 md:px-10 md:py-12 max-h-[95vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <rect x="3" y="5" width="18" height="11" rx="2" />
              </svg>
            </div>
            <span className="font-semibold text-secondary">Evo Transport</span>
          </div>

          <div className="mb-6">
            <h2 className="text-primary text-2xl md:text-3xl font-bold leading-tight mb-1">
              Create account
            </h2>
            <p className="text-muted-foreground text-sm">
              Passenger account — book and manage trips in one place
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-muted-foreground">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  disabled={loading}
                  placeholder="+32 …"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                />
              </div>
            </div>

            <PasswordField
              name="password"
              label="Password"
              placeholder="At least 8 characters, letter + number"
              size="md"
              leftIcon={<Lock className="h-4 w-4" />}
              disabled={loading}
              required
            />

            <PasswordField
              name="confirmPassword"
              label="Confirm password"
              placeholder="Repeat password"
              size="md"
              leftIcon={<Lock className="h-4 w-4" />}
              disabled={loading}
              required
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/80 cursor-pointer transition disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:text-secondary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
