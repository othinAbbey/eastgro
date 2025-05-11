/*
  Warnings:

  - You are about to drop the `ServiceOffering` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ServiceOfferingToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceOffering" DROP CONSTRAINT "ServiceOffering_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOffering" DROP CONSTRAINT "ServiceOffering_serviceProviderId_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceOfferingToTransaction" DROP CONSTRAINT "_ServiceOfferingToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceOfferingToTransaction" DROP CONSTRAINT "_ServiceOfferingToTransaction_B_fkey";

-- DropTable
DROP TABLE "ServiceOffering";

-- DropTable
DROP TABLE "_ServiceOfferingToTransaction";

-- CreateTable
CREATE TABLE "ServiceOfferings" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "minQuantity" INTEGER DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'session',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServiceOfferings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ServiceOfferingsToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceOfferingsToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceOfferingsToTransaction_B_index" ON "_ServiceOfferingsToTransaction"("B");

-- AddForeignKey
ALTER TABLE "ServiceOfferings" ADD CONSTRAINT "ServiceOfferings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOfferings" ADD CONSTRAINT "ServiceOfferings_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceOfferingsToTransaction" ADD CONSTRAINT "_ServiceOfferingsToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "ServiceOfferings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceOfferingsToTransaction" ADD CONSTRAINT "_ServiceOfferingsToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
