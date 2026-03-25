"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings-api";
import { ApiError } from "@/lib/query/query-client";
import type { PublicPricingSettings } from "@/lib/api/settings-api";

/**
 * @param departureDateIso YYYY-MM-DD for season/rate; omit to use API default (current date on server).
 */
export function usePricingSettings(departureDateIso?: string) {
  const key = departureDateIso ?? "__current__";
  return useQuery<PublicPricingSettings, ApiError>({
    queryKey: ["settings", "pricing", key],
    queryFn: () => settingsApi.getPricing(departureDateIso),
    staleTime: 1000 * 60,
  });
}
