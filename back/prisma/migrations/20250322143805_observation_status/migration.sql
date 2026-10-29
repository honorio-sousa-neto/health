-- CreateEnum
CREATE TYPE "ObservationStage" AS ENUM ('pending', 'running', 'done');

-- AlterTable
ALTER TABLE "Observation" ADD COLUMN     "status" "ObservationStage" NOT NULL DEFAULT 'pending';
