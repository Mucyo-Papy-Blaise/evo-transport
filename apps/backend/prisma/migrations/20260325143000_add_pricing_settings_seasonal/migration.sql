-- Seasonal / climate-based EUR per-km defaults (European meteorological seasons). Admin can override via API.

CREATE TABLE "pricing_settings" (
    "id" TEXT NOT NULL,
    "springPricePerKm" DECIMAL(12,4) NOT NULL DEFAULT 1.15,
    "summerPricePerKm" DECIMAL(12,4) NOT NULL DEFAULT 1.35,
    "autumnPricePerKm" DECIMAL(12,4) NOT NULL DEFAULT 1.15,
    "winterPricePerKm" DECIMAL(12,4) NOT NULL DEFAULT 1.05,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "pricing_settings" ("id", "springPricePerKm", "summerPricePerKm", "autumnPricePerKm", "winterPricePerKm", "currency", "updatedAt")
VALUES ('default', 1.15, 1.35, 1.15, 1.05, 'EUR', CURRENT_TIMESTAMP);
