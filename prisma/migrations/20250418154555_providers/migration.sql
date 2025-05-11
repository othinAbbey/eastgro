-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "availability" TEXT NOT NULL DEFAULT 'Monday-Friday, 8AM-5PM',
ADD COLUMN     "equipment" TEXT[],
ADD COLUMN     "minOrderAmount" DOUBLE PRECISION,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "qualifications" TEXT[],
ADD COLUMN     "travelRadius" INTEGER;

-- CreateTable
CREATE TABLE "_ServiceOfferingToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceOfferingToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceOfferingToTransaction_B_index" ON "_ServiceOfferingToTransaction"("B");

-- AddForeignKey
ALTER TABLE "_ServiceOfferingToTransaction" ADD CONSTRAINT "_ServiceOfferingToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "ServiceOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceOfferingToTransaction" ADD CONSTRAINT "_ServiceOfferingToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
