"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { TextField } from "@/components/ui/input";
import { MutationError } from "@/types";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/types";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { authApi } from "@/lib/api/auth-api";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authApi.forgotPassword(data),
    onSuccess: (response) => {
      if (response?.success === false) {
        toast.error(response?.message || "Something went wrong");
        return;
      }
      toast.success(
        response?.message || "Email sent!",
        "Check your inbox for password reset instructions",
      );
      setEmailSent(true);
    },
    onError: (error: MutationError) => {
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Something went wrong";
      toast.error(errorMessage, "Please try again later");
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  // ── Shared layout wrapper ──
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-secondary">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/forgotpassword.jpg"
          alt="background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-secondary/50" />
      </div>

      {/* Left side brand text (desktop) */}
      <div className="relative z-10 hidden md:flex flex-col justify-end flex-1 h-screen p-12 pb-16">
        <span className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Link href="/" className="relative shrink-0 group">
              <Image
                src="/eco-logo-nobg.png"
                alt="EVO Transport"
                width={72}
                height={36}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>
          </div>
          <span className="text-accent-foreground- font-semibold text-lg tracking-wide">
            ECO-TRANSPORT
          </span>
        </span>

        <h1 className="text-white text-5xl font-bold leading-tight mb-4 max-w-md">
          Forgot your
          <br />
          password?
        </h1>
        <p className="text-white/70 text-base max-w-xs">
          Don&apos;t worry, we&apos;ll help you reset it in just a few steps.
        </p>

        <div className="flex gap-2 mt-8">
          <div className="w-6 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Right side card */}
      <div className="relative z-10 flex items-center justify-center w-full md:w-auto md:min-w-130 md:max-w-140 min-h-screen md:min-h-0 px-4 py-10 md:py-0 md:mr-12">
        <div className="w-full bg-card rounded-3xl shadow-2xl px-10 py-12">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Link href="/" className="relative shrink-0 group">
                <Image
                  src="/eco-logo-nobg.png"
                  alt="EVO Transport"
                  width={72}
                  height={36}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </Link>
            </div>
            <span className="font-semibold text-secondary">ECO-TRANSPORT</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );

  // ── Email sent success state ──
  if (emailSent) {
    return (
      // eslint-disable-next-line react-hooks/static-components
      <Layout>
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-secondary text-3xl font-bold leading-tight mb-2">
              Check your email
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              We&apos;ve sent a password reset link to your email address.
              Please check your inbox and follow the instructions.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border" />

          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-primary font-semibold hover:text-secondary transition-colors"
            >
              try another email
            </button>
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </Layout>
    );
  }

  // ── Main form ──
  return (
    // eslint-disable-next-line react-hooks/static-components
    <Layout>
      {/* Back link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-secondary text-3xl font-bold leading-tight mb-1">
          Forgot password
        </h2>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <TextField
          label="Email address"
          type="email"
          placeholder="hey@example.com"
          size="lg"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          helperText="We'll send a password reset link to this email"
          disabled={forgotPasswordMutation.isPending}
          required
          {...register("email")}
        />

        <Button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full h-12 rounded-xl cursor-pointer font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      {/* Back to login */}
      <p className="text-center text-sm text-muted-foreground mt-7">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:text-secondary transition-colors"
        >
          Log in
        </Link>
      </p>
    </Layout>
  );
}
