-- CreateEnum
CREATE TYPE "ProduceStatus" AS ENUM ('HARVESTED', 'IN_TRANSIT', 'PROCESSED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED');

-- CreateEnum
CREATE TYPE "QualityGrade" AS ENUM ('A', 'B', 'C', 'D', 'FAILED');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "Produce" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'Eastern',
    "quantity" INTEGER NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "qualityReport" "QualityGrade",
    "status" "ProduceStatus" NOT NULL DEFAULT 'HARVESTED',
    "isBiofortified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "storedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "transporterId" TEXT,
    "facilityId" TEXT,
    "storageId" TEXT,
    "destination" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryDate" TIMESTAMP(3),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transporter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicleDetails" TEXT,
    "contact" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "Region" TEXT NOT NULL,

    CONSTRAINT "Transporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "processingDetails" TEXT,
    "workload" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "farmDetails" TEXT,
    "role" TEXT NOT NULL DEFAULT 'farmer',
    "groupId" TEXT,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "purchaseHistory" TEXT,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "cropType" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "farmtype" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "Crop" TEXT NOT NULL,
    "Disease" TEXT NOT NULL,
    "Pest" TEXT NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemProgress" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "update" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "status" "ProblemStatus" NOT NULL DEFAULT 'REPORTED',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "From" TIMESTAMP(3) NOT NULL,
    "To" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loadAtFacility" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "loadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loadAtFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "units" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transporterId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketListing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "sellerType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "produceId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProduceProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProduceProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ShipmentToloadAtFacility" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShipmentToloadAtFacility_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProduceFacilities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProduceFacilities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FacilityProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FacilityProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FarmerProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FarmerProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_QRCodeProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_QRCodeProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ShipmentProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShipmentProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TransactionProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TransactionProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Storage_produceId_key" ON "Storage"("produceId");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_contact_key" ON "Farmer"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_contact_key" ON "Customer"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_produceId_key" ON "QRCode"("produceId");

-- CreateIndex
CREATE INDEX "_ProduceProducts_B_index" ON "_ProduceProducts"("B");

-- CreateIndex
CREATE INDEX "_ShipmentToloadAtFacility_B_index" ON "_ShipmentToloadAtFacility"("B");

-- CreateIndex
CREATE INDEX "_ProduceFacilities_B_index" ON "_ProduceFacilities"("B");

-- CreateIndex
CREATE INDEX "_FacilityProducts_B_index" ON "_FacilityProducts"("B");

-- CreateIndex
CREATE INDEX "_FarmerProducts_B_index" ON "_FarmerProducts"("B");

-- CreateIndex
CREATE INDEX "_QRCodeProducts_B_index" ON "_QRCodeProducts"("B");

-- CreateIndex
CREATE INDEX "_ShipmentProducts_B_index" ON "_ShipmentProducts"("B");

-- CreateIndex
CREATE INDEX "_TransactionProducts_B_index" ON "_TransactionProducts"("B");

-- CreateIndex
CREATE INDEX "_ProductToTransaction_B_index" ON "_ProductToTransaction"("B");

-- AddForeignKey
ALTER TABLE "Produce" ADD CONSTRAINT "Produce_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farmer" ADD CONSTRAINT "Farmer_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemProgress" ADD CONSTRAINT "ProblemProgress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loadAtFacility" ADD CONSTRAINT "loadAtFacility_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loadAtFacility" ADD CONSTRAINT "loadAtFacility_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProduceProducts" ADD CONSTRAINT "_ProduceProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProduceProducts" ADD CONSTRAINT "_ProduceProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShipmentToloadAtFacility" ADD CONSTRAINT "_ShipmentToloadAtFacility_A_fkey" FOREIGN KEY ("A") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShipmentToloadAtFacility" ADD CONSTRAINT "_ShipmentToloadAtFacility_B_fkey" FOREIGN KEY ("B") REFERENCES "loadAtFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProduceFacilities" ADD CONSTRAINT "_ProduceFacilities_A_fkey" FOREIGN KEY ("A") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProduceFacilities" ADD CONSTRAINT "_ProduceFacilities_B_fkey" FOREIGN KEY ("B") REFERENCES "Produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilityProducts" ADD CONSTRAINT "_FacilityProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilityProducts" ADD CONSTRAINT "_FacilityProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FarmerProducts" ADD CONSTRAINT "_FarmerProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FarmerProducts" ADD CONSTRAINT "_FarmerProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QRCodeProducts" ADD CONSTRAINT "_QRCodeProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QRCodeProducts" ADD CONSTRAINT "_QRCodeProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShipmentProducts" ADD CONSTRAINT "_ShipmentProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShipmentProducts" ADD CONSTRAINT "_ShipmentProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionProducts" ADD CONSTRAINT "_TransactionProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionProducts" ADD CONSTRAINT "_TransactionProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTransaction" ADD CONSTRAINT "_ProductToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTransaction" ADD CONSTRAINT "_ProductToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
