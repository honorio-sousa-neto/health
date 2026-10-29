/*
  Warnings:

  - You are about to drop the column `description` on the `Ambulatory` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Ambulatory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ambulatory" DROP COLUMN "description",
DROP COLUMN "name";
