-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "stage" "Stage" NOT NULL DEFAULT 'SCREENING';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "config" JSONB;

-- CreateTable
CREATE TABLE "RequestExams" (
    "id" UUID NOT NULL,
    "consultationId" UUID NOT NULL,
    "examId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RequestExams_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestExams" ADD CONSTRAINT "RequestExams_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestExams" ADD CONSTRAINT "RequestExams_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
