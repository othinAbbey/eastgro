/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `produceId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "userRole" AS ENUM ('ADMIN', 'FARMER', 'CUSTOMER', 'TRANSPORTER', 'FACILITY_MANAGER', 'AGENT', 'EXPERT');

-- CreateEnum
CREATE TYPE "TraceActionType" AS ENUM ('HARVESTED', 'LOADED', 'TRANSPORTED', 'STORED', 'DELIVERED', 'SOLD');

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_produceId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "createdAt",
DROP COLUMN "produceId",
DROP COLUMN "productId",
DROP COLUMN "updatedAt",
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'CASH';

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Input" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Input_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "userRole" NOT NULL DEFAULT 'FARMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraceabilityLog" (
    "id" TEXT NOT NULL,
    "actionType" "TraceActionType" NOT NULL,
    "productId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TraceabilityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TransactionProduce" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TransactionProduce_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TransactionServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TransactionServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TransactionInputs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TransactionInputs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_contact_key" ON "User"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "_TransactionProduce_B_index" ON "_TransactionProduce"("B");

-- CreateIndex
CREATE INDEX "_TransactionServices_B_index" ON "_TransactionServices"("B");

-- CreateIndex
CREATE INDEX "_TransactionInputs_B_index" ON "_TransactionInputs"("B");

-- AddForeignKey
ALTER TABLE "TraceabilityLog" ADD CONSTRAINT "TraceabilityLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionProduce" ADD CONSTRAINT "_TransactionProduce_A_fkey" FOREIGN KEY ("A") REFERENCES "Produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionProduce" ADD CONSTRAINT "_TransactionProduce_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionServices" ADD CONSTRAINT "_TransactionServices_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionServices" ADD CONSTRAINT "_TransactionServices_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionInputs" ADD CONSTRAINT "_TransactionInputs_A_fkey" FOREIGN KEY ("A") REFERENCES "Input"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionInputs" ADD CONSTRAINT "_TransactionInputs_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
