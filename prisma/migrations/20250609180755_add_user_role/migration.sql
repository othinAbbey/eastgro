/*
  Warnings:

  - Made the column `userRole` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userRole" SET NOT NULL,
ALTER COLUMN "userRole" SET DEFAULT 'CUSTOMER';
