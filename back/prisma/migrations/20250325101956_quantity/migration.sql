/*
  Warnings:

  - Added the required column `quantity` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PrescriptionItem" ADD COLUMN     "quantity" TEXT NOT NULL;
