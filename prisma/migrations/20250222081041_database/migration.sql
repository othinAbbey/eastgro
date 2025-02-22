/*
  Warnings:

  - The primary key for the `Farmer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Farmer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Farmer` table. All the data in the column will be lost.
  - You are about to drop the column `farm_location` on the `Farmer` table. All the data in the column will be lost.
  - You are about to drop the column `farm_type` on the `Farmer` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Farmer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Farmer` table. All the data in the column will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contact` to the `Farmer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Farmer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_farmerId_fkey";

-- DropIndex
DROP INDEX "Farmer_email_key";

-- AlterTable
ALTER TABLE "Farmer" DROP CONSTRAINT "Farmer_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "farm_location",
DROP COLUMN "farm_type",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
ADD COLUMN     "contact" TEXT NOT NULL,
ADD COLUMN     "farmDetails" TEXT,
ADD COLUMN     "location" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Farmer_id_seq";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "Report";

-- CreateTable
CREATE TABLE "Produce" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "qualityReport" TEXT,

    CONSTRAINT "Produce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transporter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicleDetails" TEXT,
    "contact" TEXT NOT NULL,

    CONSTRAINT "Transporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "processingDetails" TEXT,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "transporterId" TEXT,
    "facilityId" TEXT,
    "destination" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "purchaseHistory" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannedAt" TIMESTAMP(3),

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_produceId_key" ON "QRCode"("produceId");

-- AddForeignKey
ALTER TABLE "Produce" ADD CONSTRAINT "Produce_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
