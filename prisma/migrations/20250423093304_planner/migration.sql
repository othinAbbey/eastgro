-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('ONE_TIME', 'SEASONAL');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('LAND_PREPARATION', 'PLANTING', 'MANAGEMENT', 'HARVEST', 'POST_HARVEST', 'MARKETING');

-- CreateTable
CREATE TABLE "CropVariety" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "yieldPerAcre" DOUBLE PRECISION NOT NULL,
    "kgPerAcre" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cropId" TEXT NOT NULL,

    CONSTRAINT "CropVariety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plantingDate" TIMESTAMP(3) NOT NULL,
    "gardenSize" DOUBLE PRECISION NOT NULL,
    "farmerId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "estimatedYield" DOUBLE PRECISION,
    "estimatedRevenue" DOUBLE PRECISION,
    "estimatedProfit" DOUBLE PRECISION,

    CONSTRAINT "FarmPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cost" (
    "id" TEXT NOT NULL,
    "farmPlanId" TEXT NOT NULL,
    "type" "CostType" NOT NULL,
    "stage" "Stage" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmActivity" (
    "id" TEXT NOT NULL,
    "farmPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmRecord" (
    "id" TEXT NOT NULL,
    "farmPlanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CropVariety" ADD CONSTRAINT "CropVariety_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmPlan" ADD CONSTRAINT "FarmPlan_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmPlan" ADD CONSTRAINT "FarmPlan_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "CropVariety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cost" ADD CONSTRAINT "Cost_farmPlanId_fkey" FOREIGN KEY ("farmPlanId") REFERENCES "FarmPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmActivity" ADD CONSTRAINT "FarmActivity_farmPlanId_fkey" FOREIGN KEY ("farmPlanId") REFERENCES "FarmPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmRecord" ADD CONSTRAINT "FarmRecord_farmPlanId_fkey" FOREIGN KEY ("farmPlanId") REFERENCES "FarmPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
