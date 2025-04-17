/*
  Warnings:

  - You are about to drop the column `units` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Produce" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'kgs';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "units",
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'Kgs';
