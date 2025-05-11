/*
  Warnings:

  - You are about to drop the column `costName` on the `CostTemplate` table. All the data in the column will be lost.
  - Added the required column `category` to the `CostTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CostTemplate" DROP COLUMN "costName",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true;
