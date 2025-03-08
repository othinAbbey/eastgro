/*
  Warnings:

  - You are about to drop the `Crop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Crop" DROP CONSTRAINT "Crop_farmerId_fkey";

-- AlterTable
ALTER TABLE "Produce" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'Eastern';

-- DropTable
DROP TABLE "Crop";
