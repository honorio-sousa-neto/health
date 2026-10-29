/*
  Warnings:

  - You are about to drop the column `age` on the `Screening` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Screening` table. All the data in the column will be lost.
  - You are about to drop the column `pulse` on the `Screening` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `Screening` table. All the data in the column will be lost.
  - The `breathingRate` column on the `Screening` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `heartbeatRate` column on the `Screening` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `bloodPressure` column on the `Screening` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('GREEN', 'ORANGE', 'RED');

-- AlterTable
ALTER TABLE "Screening" DROP COLUMN "age",
DROP COLUMN "gender",
DROP COLUMN "pulse",
DROP COLUMN "temperature",
ADD COLUMN     "chronicIll" TEXT,
ADD COLUMN     "fever" "Criticality",
ADD COLUMN     "isChronicPatient" BOOLEAN,
ADD COLUMN     "isDrinker" BOOLEAN,
ADD COLUMN     "isSmoker" BOOLEAN,
ADD COLUMN     "oxygen" "Criticality",
DROP COLUMN "breathingRate",
ADD COLUMN     "breathingRate" "Criticality",
DROP COLUMN "heartbeatRate",
ADD COLUMN     "heartbeatRate" "Criticality",
DROP COLUMN "bloodPressure",
ADD COLUMN     "bloodPressure" "Criticality";
