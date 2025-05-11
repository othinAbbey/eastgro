/*
  Warnings:

  - You are about to alter the column `basePrice` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `ServiceOfferings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ServiceOfferingsToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceOfferings" DROP CONSTRAINT "ServiceOfferings_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOfferings" DROP CONSTRAINT "ServiceOfferings_serviceProviderId_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceOfferingsToTransaction" DROP CONSTRAINT "_ServiceOfferingsToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceOfferingsToTransaction" DROP CONSTRAINT "_ServiceOfferingsToTransaction_B_fkey";

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "basePrice" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "ServiceOfferings";

-- DropTable
DROP TABLE "_ServiceOfferingsToTransaction";

-- CreateTable
CREATE TABLE "ServiceOffering" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "ServiceOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offering" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ServiceOfferingToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceOfferingToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ServiceOfferingToServiceProvider" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceOfferingToServiceProvider_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceOfferingToTransaction_B_index" ON "_ServiceOfferingToTransaction"("B");

-- CreateIndex
CREATE INDEX "_ServiceOfferingToServiceProvider_B_index" ON "_ServiceOfferingToServiceProvider"("B");

-- AddForeignKey
ALTER TABLE "ServiceOffering" ADD CONSTRAINT "ServiceOffering_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOffering" ADD CONSTRAINT "ServiceOffering_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOffering" ADD CONSTRAINT "ServiceOffering_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceOfferingToTransaction" ADD CONSTRAINT "_ServiceOfferingToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "ServiceOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceOfferingToTransaction" ADD CONSTRAINT "_ServiceOfferingToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceOfferingToServiceProvider" ADD CONSTRAINT "_ServiceOfferingToServiceProvider_A_fkey" FOREIGN KEY ("A") REFERENCES "ServiceOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceOfferingToServiceProvider" ADD CONSTRAINT "_ServiceOfferingToServiceProvider_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
