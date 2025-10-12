/*
  Warnings:

  - The values [SOLE_TRADER,PASSIVE_TRADER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'FARMER', 'CUSTOMER', 'SOLETRADER', 'PASSIVETRADER', 'GUEST', 'EXPERT');
ALTER TABLE "ServiceProvider" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "userRole" TYPE "UserRole_new" USING ("userRole"::text::"UserRole_new");
ALTER TABLE "ServiceProvider" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "ServiceProvider" ALTER COLUMN "role" SET DEFAULT 'EXPERT';
COMMIT;
