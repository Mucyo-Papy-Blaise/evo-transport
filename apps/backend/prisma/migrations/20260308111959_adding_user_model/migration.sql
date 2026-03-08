/*
  Warnings:

  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guestSessionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PASSENGER', 'DRIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'FR', 'RW', 'SW');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'RWF', 'GBP');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('HOME', 'WORK', 'AIRPORT', 'HOTEL', 'OTHER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
DROP COLUMN "password",
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "guestExpiresAt" TIMESTAMP(3),
ADD COLUMN     "guestSessionId" TEXT,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isGuest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "preferredCurrency" "Currency" NOT NULL DEFAULT 'USD',
ADD COLUMN     "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PASSENGER',
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "SavedLocation" (
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

    CONSTRAINT "SavedLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedLocation_userId_idx" ON "SavedLocation"("userId");

-- CreateIndex
CREATE INDEX "SavedLocation_type_idx" ON "SavedLocation"("type");

-- CreateIndex
CREATE INDEX "SavedLocation_airportCode_idx" ON "SavedLocation"("airportCode");

-- CreateIndex
CREATE UNIQUE INDEX "SavedLocation_userId_name_key" ON "SavedLocation"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_guestSessionId_key" ON "User"("guestSessionId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_guestSessionId_idx" ON "User"("guestSessionId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- AddForeignKey
ALTER TABLE "SavedLocation" ADD CONSTRAINT "SavedLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
