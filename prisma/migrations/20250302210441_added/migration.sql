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
CREATE TABLE "_ShipmentToloadAtFacility" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShipmentToloadAtFacility_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ShipmentToloadAtFacility_B_index" ON "_ShipmentToloadAtFacility"("B");

-- AddForeignKey
ALTER TABLE "loadAtFacility" ADD CONSTRAINT "loadAtFacility_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loadAtFacility" ADD CONSTRAINT "loadAtFacility_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShipmentToloadAtFacility" ADD CONSTRAINT "_ShipmentToloadAtFacility_A_fkey" FOREIGN KEY ("A") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShipmentToloadAtFacility" ADD CONSTRAINT "_ShipmentToloadAtFacility_B_fkey" FOREIGN KEY ("B") REFERENCES "loadAtFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
