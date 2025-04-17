/*
  Warnings:

  - You are about to drop the `Input` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TransactionInputs" DROP CONSTRAINT "_TransactionInputs_A_fkey";

-- DropTable
DROP TABLE "Input";

-- CreateTable
CREATE TABLE "FarmInput" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmInput_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "_TransactionInputs" ADD CONSTRAINT "_TransactionInputs_A_fkey" FOREIGN KEY ("A") REFERENCES "FarmInput"("id") ON DELETE CASCADE ON UPDATE CASCADE;
