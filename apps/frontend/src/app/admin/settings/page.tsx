"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-context";
import { useUpdateProfile } from "@/lib/auth/auth-queries";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import { settingsApi } from "@/lib/api/settings-api";
import { toast } from "@/components/ui/toast";
import type { Currency } from "@/types/enum";
import type { LanguageCode } from "@/types/auth.types";
import { ApiError } from "@/lib/query/query-client";

const LANGUAGES: { value: LanguageCode; label: string }[] = [
  { value: "EN", label: "English" },
  { value: "FR", label: "Français" },
  { value: "RW", label: "Kinyarwanda" },
  { value: "SW", label: "Kiswahili" },
];

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
  { value: "RWF", label: "RWF" },
];

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { data: pricing, isLoading: pricingLoading } = usePricingSettings();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] =
    useState<LanguageCode>("EN");
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>("EUR");

  const [spring, setSpring] = useState("");
  const [summer, setSummer] = useState("");
  const [autumn, setAutumn] = useState("");
  const [winter, setWinter] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
    if (user.preferredLanguage)
      setPreferredLanguage(user.preferredLanguage as LanguageCode);
    if (user.preferredCurrency)
      setPreferredCurrency(user.preferredCurrency as Currency);
  }, [user]);

  useEffect(() => {
    if (!pricing) return;
    setSpring(String(pricing.springPricePerKm));
    setSummer(String(pricing.summerPricePerKm));
    setAutumn(String(pricing.autumnPricePerKm));
    setWinter(String(pricing.winterPricePerKm));
  }, [pricing]);

  const savePricing = useMutation({
    mutationFn: () =>
      settingsApi.updateSeasonalPricing({
        springPricePerKm: parseFloat(spring),
        summerPricePerKm: parseFloat(summer),
        autumnPricePerKm: parseFloat(autumn),
        winterPricePerKm: parseFloat(winter),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings", "pricing"] });
      toast.success("Pricing saved", "Seasonal per-km rates are updated.");
    },
    onError: (e: ApiError) => {
      toast.error("Could not save pricing", e.message);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
      preferredLanguage,
      preferredCurrency,
    });
  };

  const handlePricingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nums = [spring, summer, autumn, winter].map((s) => parseFloat(s));
    if (nums.some((n) => Number.isNaN(n) || n < 0)) {
      toast.error("Invalid values", "Enter a non-negative number for each season.");
      return;
    }
    savePricing.mutate();
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <p className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update your admin profile and manage seasonal distance-based pricing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Name, phone, and preferences for your account ({user?.email}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5"
                placeholder="+32 ..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* <div>
                <Label>Preferred language</Label>
                <Select
                  value={preferredLanguage}
                  onValueChange={(v) => setPreferredLanguage(v as LanguageCode)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
              <div>
                <Label>Preferred currency</Label>
                <Select
                  value={preferredCurrency}
                  onValueChange={(v) => setPreferredCurrency(v as Currency)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seasonal price per km</CardTitle>
          <CardDescription>
            Rates apply to route fares as <strong>distance × rate</strong> per
            person (one way). Seasons follow{" "}
            <strong>European meteorological</strong> boundaries: spring Mar–May,
            summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb. The active rate for
            a booking is chosen from the passenger&apos;s{" "}
            <strong>departure date</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pricingLoading && !pricing ? (
            <p className="text-sm text-muted-foreground">Loading current rates…</p>
          ) : (
            <form onSubmit={handlePricingSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Currency for quotes:{" "}
                <span className="font-medium text-foreground">
                  {pricing?.currency ?? "EUR"}
                </span>
                {pricing && (
                  <>
                    {" "}
                    · Today&apos;s season:{" "}
                    <span className="font-medium text-foreground">
                      {pricing.season}
                    </span>{" "}
                    ({pricing.effectivePricePerKm} / km)
                  </>
                )}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spring">Spring (Mar–May)</Label>
                  <Input
                    id="spring"
                    type="number"
                    step="0.0001"
                    min={0}
                    value={spring}
                    onChange={(e) => setSpring(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="summer">Summer (Jun–Aug)</Label>
                  <Input
                    id="summer"
                    type="number"
                    step="0.0001"
                    min={0}
                    value={summer}
                    onChange={(e) => setSummer(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="autumn">Autumn (Sep–Nov)</Label>
                  <Input
                    id="autumn"
                    type="number"
                    step="0.0001"
                    min={0}
                    value={autumn}
                    onChange={(e) => setAutumn(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="winter">Winter (Dec–Feb)</Label>
                  <Input
                    id="winter"
                    type="number"
                    step="0.0001"
                    min={0}
                    value={winter}
                    onChange={(e) => setWinter(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <Button type="submit" disabled={savePricing.isPending}>
                {savePricing.isPending ? "Saving…" : "Save seasonal rates"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
