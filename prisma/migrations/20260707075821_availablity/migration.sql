/*
  Warnings:

  - Added the required column `technicianId` to the `availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "availability" ADD COLUMN     "technicianId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
