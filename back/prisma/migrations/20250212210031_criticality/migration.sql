/*
  Warnings:

  - The `bloodPressure` column on the `Screening` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Screening" ADD COLUMN     "bloodPressureDescription" TEXT,
DROP COLUMN "bloodPressure",
ADD COLUMN     "bloodPressure" "Criticality";
