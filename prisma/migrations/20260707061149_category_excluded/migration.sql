/*
  Warnings:

  - You are about to drop the column `categoryId` on the `service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "service" DROP CONSTRAINT "service_categoryId_fkey";

-- AlterTable
ALTER TABLE "service" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "technician" ALTER COLUMN "isVerified" SET DEFAULT true;
