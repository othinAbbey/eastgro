-- AlterEnum
ALTER TYPE "CostType" ADD VALUE 'INVESTMENTCOSTS';

-- AlterTable
ALTER TABLE "CropVariety" ADD COLUMN     "marketPricePerKg" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Farmer" ALTER COLUMN "role" SET DEFAULT 'FARMER';

-- CreateTable
CREATE TABLE "CostTemplate" (
    "id" TEXT NOT NULL,
    "costName" TEXT NOT NULL,
    "type" "CostType" NOT NULL,
    "stage" "Stage" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "cropId" TEXT NOT NULL,

    CONSTRAINT "CostTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CostTemplate" ADD CONSTRAINT "CostTemplate_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
