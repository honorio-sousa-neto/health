-- AlterTable
ALTER TABLE "Observation" ADD COLUMN     "customerId" UUID;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
