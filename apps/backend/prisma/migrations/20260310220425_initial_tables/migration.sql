/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ONE_WAY', 'ROUND_TRIP');

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "SavedLocation" DROP CONSTRAINT "SavedLocation_userId_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "SavedLocation";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "profilePicture" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PASSENGER',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "guestSessionId" TEXT,
    "guestExpiresAt" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
    "preferredCurrency" "Currency" NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_locations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'OTHER',
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "airportCode" TEXT,
    "terminal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "body" JSONB,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "responseTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "userId" TEXT,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "guestSessionId" TEXT,
    "tripType" "TripType" NOT NULL,
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "fromCode" TEXT,
    "toCode" TEXT,
    "fromCity" TEXT,
    "toCity" TEXT,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "departureTime" TEXT NOT NULL,
    "returnTime" TEXT,
    "passengers" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'RWF',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "adminRespondedAt" TIMESTAMP(3),
    "adminRespondedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "userId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "recipientType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_guestSessionId_key" ON "users"("guestSessionId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_guestSessionId_idx" ON "users"("guestSessionId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "saved_locations_userId_idx" ON "saved_locations"("userId");

-- CreateIndex
CREATE INDEX "saved_locations_type_idx" ON "saved_locations"("type");

-- CreateIndex
CREATE INDEX "saved_locations_airportCode_idx" ON "saved_locations"("airportCode");

-- CreateIndex
CREATE UNIQUE INDEX "saved_locations_userId_name_key" ON "saved_locations"("userId", "name");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_method_idx" ON "audit_logs"("method");

-- CreateIndex
CREATE INDEX "audit_logs_status_idx" ON "audit_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingReference_key" ON "Booking"("bookingReference");

-- CreateIndex
CREATE INDEX "Booking_bookingReference_idx" ON "Booking"("bookingReference");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_guestEmail_idx" ON "Booking"("guestEmail");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateIndex
CREATE INDEX "Booking_departureDate_idx" ON "Booking"("departureDate");

-- CreateIndex
CREATE INDEX "Booking_fromCode_idx" ON "Booking"("fromCode");

-- CreateIndex
CREATE INDEX "Booking_toCode_idx" ON "Booking"("toCode");

-- CreateIndex
CREATE INDEX "Booking_fromLocation_idx" ON "Booking"("fromLocation");

-- CreateIndex
CREATE INDEX "Booking_toLocation_idx" ON "Booking"("toLocation");

-- CreateIndex
CREATE INDEX "notifications_bookingId_idx" ON "notifications"("bookingId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_recipientEmail_idx" ON "notifications"("recipientEmail");

-- CreateIndex
CREATE INDEX "notifications_sentAt_idx" ON "notifications"("sentAt");

-- AddForeignKey
ALTER TABLE "saved_locations" ADD CONSTRAINT "saved_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
