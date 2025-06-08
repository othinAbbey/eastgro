/*
  Warnings:

  - You are about to drop the column `role` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Farmer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Farmer" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "TraceabilityLog" ADD COLUMN     "produceId" TEXT;

-- AddForeignKey
ALTER TABLE "TraceabilityLog" ADD CONSTRAINT "TraceabilityLog_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE SET NULL ON UPDATE CASCADE;
