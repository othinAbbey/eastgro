/*
  Warnings:

  - You are about to drop the `_ProductToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToTransaction" DROP CONSTRAINT "_ProductToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToTransaction" DROP CONSTRAINT "_ProductToTransaction_B_fkey";

-- DropTable
DROP TABLE "_ProductToTransaction";
