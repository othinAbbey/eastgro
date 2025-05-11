/*
  Warnings:

  - You are about to drop the column `yieldPerAcre` on the `CropVariety` table. All the data in the column will be lost.
  - Added the required column `yieldPotential` to the `CropVariety` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CropVariety" DROP COLUMN "yieldPerAcre",
ADD COLUMN     "yieldPotential" TEXT NOT NULL;
