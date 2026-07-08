/*
  Warnings:

  - A unique constraint covering the columns `[stripeIntentId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeIntentId` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "stripeIntentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payment_stripeIntentId_key" ON "payment"("stripeIntentId");
