-- CreateEnum
CREATE TYPE "StatusScreening" AS ENUM ('PENDING', 'RUNNING', 'FINISHED', 'CANCELED');

-- AlterTable
ALTER TABLE "Screening" ADD COLUMN     "status" "StatusScreening" NOT NULL DEFAULT 'PENDING';
