-- CreateEnum AttendanceStatus (safe for existing DBs)
DO $$ BEGIN
    CREATE TYPE "AttendanceStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'DONE', 'CANCELED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable Attendance
CREATE TABLE IF NOT EXISTS "Attendance" (
    "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
    "reference"      TEXT NOT NULL,
    "customerId"     UUID NOT NULL,
    "receptionistId" UUID,
    "serviceId"      UUID,
    "status"         "AttendanceStatus" NOT NULL DEFAULT 'WAITING',
    "note"           TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt"      TIMESTAMP(3),

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_reference_key" ON "Attendance"("reference");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Attendance_customerId_fkey') THEN
        ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_customerId_fkey"
            FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Attendance_receptionistId_fkey') THEN
        ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_receptionistId_fkey"
            FOREIGN KEY ("receptionistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Attendance_serviceId_fkey') THEN
        ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_serviceId_fkey"
            FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AlterTable RequestExams: add customerId for standalone external exams
ALTER TABLE "RequestExams" ADD COLUMN IF NOT EXISTS "customerId" UUID;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RequestExams_customerId_fkey') THEN
        ALTER TABLE "RequestExams" ADD CONSTRAINT "RequestExams_customerId_fkey"
            FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
