-- CreateEnum
CREATE TYPE "ObservationStatus" AS ENUM ('PENDING', 'RUNNING', 'FINISHED');

-- AlterTable
ALTER TABLE "Observation" ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false;
