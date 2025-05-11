/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CropVariety` table. All the data in the column will be lost.
  - Added the required column `daysToMaturity` to the `CropVariety` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `CropVariety` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CropVariety` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yieldPerAcre` to the `CropVariety` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CropVariety" DROP COLUMN "createdAt",
ADD COLUMN     "daysToMaturity" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "yieldPerAcre" TEXT NOT NULL,
ALTER COLUMN "kgPerAcre" SET DATA TYPE TEXT;
