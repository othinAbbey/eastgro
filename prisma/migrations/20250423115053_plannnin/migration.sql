/*
  Warnings:

  - Changed the type of `kgPerAcre` on the `CropVariety` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CropVariety" DROP COLUMN "kgPerAcre",
ADD COLUMN     "kgPerAcre" INTEGER NOT NULL;
