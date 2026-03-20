/*
  Warnings:

  - You are about to drop the column `message` on the `bookings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('ADMIN', 'CUSTOMER', 'GUEST');

-- DropIndex
DROP INDEX "audit_logs_method_idx";

-- DropIndex
DROP INDEX "audit_logs_status_idx";

-- DropIndex
DROP INDEX "bookings_fromCode_idx";

-- DropIndex
DROP INDEX "bookings_fromLocation_idx";

-- DropIndex
DROP INDEX "bookings_toCode_idx";

-- DropIndex
DROP INDEX "bookings_toLocation_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "message",
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "requestMessage" TEXT,
ADD COLUMN     "statusReason" TEXT;

-- CreateTable
CREATE TABLE "booking_messages" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "senderType" "MessageSenderType" NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "guestReplyToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_messages_guestReplyToken_key" ON "booking_messages"("guestReplyToken");

-- CreateIndex
CREATE INDEX "booking_messages_bookingId_idx" ON "booking_messages"("bookingId");

-- CreateIndex
CREATE INDEX "booking_messages_guestReplyToken_idx" ON "booking_messages"("guestReplyToken");

-- CreateIndex
CREATE INDEX "booking_messages_createdAt_idx" ON "booking_messages"("createdAt");

-- AddForeignKey
ALTER TABLE "booking_messages" ADD CONSTRAINT "booking_messages_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_messages" ADD CONSTRAINT "booking_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
