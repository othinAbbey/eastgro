/*
  Warnings:

  - You are about to drop the column `From` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `To` on the `Report` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmerId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "reportId" TEXT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "From",
DROP COLUMN "To",
ADD COLUMN     "endDate" TEXT NOT NULL,
ADD COLUMN     "farmerId" TEXT NOT NULL,
ADD COLUMN     "startDate" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
