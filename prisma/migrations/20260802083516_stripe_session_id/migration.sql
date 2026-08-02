/*
  Warnings:

  - You are about to drop the column `stripeIntentId` on the `payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeSessionId` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payment_stripeIntentId_key";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "stripeIntentId",
ADD COLUMN     "stripeSessionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payment_stripeSessionId_key" ON "payment"("stripeSessionId");
