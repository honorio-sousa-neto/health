-- Completa estruturas usadas pelo cliente Prisma mas ausentes do histórico.
-- Conserva colunas e valores de enum legados para não apagar dados existentes.
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'IN_SCREENING';
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'SCREENED';
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'WAITING_DOCTOR';
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'IN_CONSULTATION';
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';

-- AlterEnum
ALTER TYPE "EntryOrOut" ADD VALUE IF NOT EXISTS 'EXIT';

-- AlterTable
ALTER TABLE "AdministrationMedicament" ADD COLUMN IF NOT EXISTS     "isThirdParty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS     "quantity" TEXT,
ADD COLUMN IF NOT EXISTS     "type" TEXT;


-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN IF NOT EXISTS     "labUserId" UUID;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS     "attendanceId" UUID;

-- AlterTable
ALTER TABLE "MedicalConsultation" ADD COLUMN IF NOT EXISTS     "attendanceId" UUID;

-- AlterTable
ALTER TABLE "MovimentationStock" ADD COLUMN IF NOT EXISTS     "attendanceId" UUID,
ADD COLUMN IF NOT EXISTS     "fromLocationId" UUID,
ADD COLUMN IF NOT EXISTS     "reason" TEXT,
ADD COLUMN IF NOT EXISTS     "toLocationId" UUID,
ADD COLUMN IF NOT EXISTS     "userId" UUID;

-- AlterTable
ALTER TABLE "RequestExams" ADD COLUMN IF NOT EXISTS     "concludedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Screening"
  ALTER COLUMN "heartbeatRate" TYPE TEXT USING "heartbeatRate"::TEXT,
  ALTER COLUMN "bloodPressure" TYPE TEXT USING "bloodPressure"::TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "classificacao" TEXT;

-- AlterTable
ALTER TABLE "Surgery" ADD COLUMN IF NOT EXISTS     "status" "ObservationStage" NOT NULL DEFAULT 'pending';


-- CreateTable
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "patientName" TEXT,
    "reference" TEXT,
    "room" TEXT NOT NULL,
    "readBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AmbulatoryPlan" (
    "id" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmbulatoryPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AmbulatorySession" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "day" INTEGER NOT NULL DEFAULT 1,
    "timeOfDay" INTEGER NOT NULL DEFAULT 1,
    "doneAt" TIMESTAMP(3),
    "doneById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmbulatorySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AmbulatoryPlan_prescriptionId_key" ON "AmbulatoryPlan"("prescriptionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MedicalConsultation_attendanceId_key" ON "MedicalConsultation"("attendanceId");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Consultation_labUserId_fkey' AND conrelid = '"Consultation"'::regclass) THEN
    ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_labUserId_fkey" FOREIGN KEY ("labUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MedicalConsultation_attendanceId_fkey' AND conrelid = '"MedicalConsultation"'::regclass) THEN
    ALTER TABLE "MedicalConsultation" ADD CONSTRAINT "MedicalConsultation_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MovimentationStock_fromLocationId_fkey' AND conrelid = '"MovimentationStock"'::regclass) THEN
    ALTER TABLE "MovimentationStock" ADD CONSTRAINT "MovimentationStock_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "StockLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MovimentationStock_toLocationId_fkey' AND conrelid = '"MovimentationStock"'::regclass) THEN
    ALTER TABLE "MovimentationStock" ADD CONSTRAINT "MovimentationStock_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "StockLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MovimentationStock_userId_fkey' AND conrelid = '"MovimentationStock"'::regclass) THEN
    ALTER TABLE "MovimentationStock" ADD CONSTRAINT "MovimentationStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MovimentationStock_attendanceId_fkey' AND conrelid = '"MovimentationStock"'::regclass) THEN
    ALTER TABLE "MovimentationStock" ADD CONSTRAINT "MovimentationStock_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_attendanceId_fkey' AND conrelid = '"Invoice"'::regclass) THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AmbulatoryPlan_customerId_fkey' AND conrelid = '"AmbulatoryPlan"'::regclass) THEN
    ALTER TABLE "AmbulatoryPlan" ADD CONSTRAINT "AmbulatoryPlan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AmbulatoryPlan_prescriptionId_fkey' AND conrelid = '"AmbulatoryPlan"'::regclass) THEN
    ALTER TABLE "AmbulatoryPlan" ADD CONSTRAINT "AmbulatoryPlan_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AmbulatorySession_planId_fkey' AND conrelid = '"AmbulatorySession"'::regclass) THEN
    ALTER TABLE "AmbulatorySession" ADD CONSTRAINT "AmbulatorySession_planId_fkey" FOREIGN KEY ("planId") REFERENCES "AmbulatoryPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AmbulatorySession_serviceId_fkey' AND conrelid = '"AmbulatorySession"'::regclass) THEN
    ALTER TABLE "AmbulatorySession" ADD CONSTRAINT "AmbulatorySession_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AmbulatorySession_doneById_fkey' AND conrelid = '"AmbulatorySession"'::regclass) THEN
    ALTER TABLE "AmbulatorySession" ADD CONSTRAINT "AmbulatorySession_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

