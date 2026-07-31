/*
  Warnings:

  - Added the required column `thumbnail` to the `service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service" ADD COLUMN     "thumbnail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "profilePicture" TEXT;
