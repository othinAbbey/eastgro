/*
  Warnings:

  - Added the required column `password` to the `Farmer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Farmer" ADD COLUMN     "password" TEXT NOT NULL;
