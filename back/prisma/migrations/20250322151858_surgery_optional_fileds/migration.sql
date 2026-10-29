-- DropForeignKey
ALTER TABLE "Surgery" DROP CONSTRAINT "Surgery_customerId_fkey";

-- AlterTable
ALTER TABLE "Surgery" ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
