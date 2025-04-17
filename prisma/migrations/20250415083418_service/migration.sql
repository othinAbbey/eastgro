/*
  Warnings:

  - You are about to drop the column `availability` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `equipment` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `minOrderAmount` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `qualifications` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `travelRadius` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ServiceProvider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "availability",
DROP COLUMN "equipment",
DROP COLUMN "minOrderAmount",
DROP COLUMN "profileImage",
DROP COLUMN "qualifications",
DROP COLUMN "travelRadius",
DROP COLUMN "updatedAt";
