/*
  Warnings:

  - Made the column `UserRole` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "UserRole" SET NOT NULL,
ALTER COLUMN "UserRole" SET DEFAULT 'CUSTOMER';
