-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "internmentId" UUID,
ADD COLUMN     "observationId" UUID;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_internmentId_fkey" FOREIGN KEY ("internmentId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
