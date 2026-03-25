import { apiClient } from "@/lib/api/api-client";

export type MeteorologicalSeason =
  | "SPRING"
  | "SUMMER"
  | "AUTUMN"
  | "WINTER";

export interface PublicPricingSettings {
  springPricePerKm: number;
  summerPricePerKm: number;
  autumnPricePerKm: number;
  winterPricePerKm: number;
  currency: string;
  season: MeteorologicalSeason;
  effectivePricePerKm: number;
}

export interface UpdateSeasonalPricingBody {
  springPricePerKm: number;
  summerPricePerKm: number;
  autumnPricePerKm: number;
  winterPricePerKm: number;
}

export const settingsApi = {
  getPricing: (departureDate?: string) => {
    const q = departureDate
      ? `?departureDate=${encodeURIComponent(departureDate)}`
      : "";
    return apiClient.get<PublicPricingSettings>(`/settings/pricing${q}`);
  },

  updateSeasonalPricing: (body: UpdateSeasonalPricingBody) =>
    apiClient.patch<PublicPricingSettings>("/admin/settings/pricing", body),
};
