/*
  Warnings:

  - You are about to drop the column `cost` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `basePrice` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_transactionId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "cost",
DROP COLUMN "transactionId",
ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
