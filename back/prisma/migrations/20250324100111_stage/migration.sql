-- DropForeignKey
ALTER TABLE "AdministrationMedicament" DROP CONSTRAINT "AdministrationMedicament_customerId_fkey";

-- DropForeignKey
ALTER TABLE "AdministrationMedicament" DROP CONSTRAINT "AdministrationMedicament_userId_fkey";

-- AlterTable
ALTER TABLE "AdministrationMedicament" ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ObservationStage" NOT NULL DEFAULT 'pending',
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AdministrationMedicament" ADD CONSTRAINT "AdministrationMedicament_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrationMedicament" ADD CONSTRAINT "AdministrationMedicament_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
