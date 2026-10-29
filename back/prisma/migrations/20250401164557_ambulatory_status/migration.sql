-- CreateEnum
CREATE TYPE "AmbulatoryStatus" AS ENUM ('CLOSED', 'OPEN');

-- AlterTable
ALTER TABLE "Ambulatory" ADD COLUMN     "status" "AmbulatoryStatus" NOT NULL DEFAULT 'OPEN';
