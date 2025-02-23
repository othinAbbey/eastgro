-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'customer';

-- AlterTable
ALTER TABLE "Farmer" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'farmer';
