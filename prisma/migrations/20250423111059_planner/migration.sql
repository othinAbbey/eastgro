/*
  Warnings:

  - You are about to drop the column `cropName` on the `CropVariety` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `CropVariety` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CropVariety" DROP COLUMN "cropName",
DROP COLUMN "name";
