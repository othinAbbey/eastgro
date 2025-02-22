/*
  Warnings:

  - The `qualityReport` column on the `Produce` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Shipment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProduceStatus" AS ENUM ('HARVESTED', 'IN_TRANSIT', 'PROCESSED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED');

-- CreateEnum
CREATE TYPE "QualityGrade" AS ENUM ('A', 'B', 'C', 'D', 'FAILED');

-- AlterTable
ALTER TABLE "Produce" ADD COLUMN     "status" "ProduceStatus" NOT NULL DEFAULT 'HARVESTED',
DROP COLUMN "qualityReport",
ADD COLUMN     "qualityReport" "QualityGrade";

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "status",
ADD COLUMN     "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING';
