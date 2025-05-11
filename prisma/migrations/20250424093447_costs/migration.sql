/*
  Warnings:

  - You are about to drop the column `category` on the `Cost` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `CostTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cost" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "CostTemplate" DROP COLUMN "category";
