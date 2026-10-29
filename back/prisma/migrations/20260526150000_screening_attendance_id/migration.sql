-- Add attendanceId to Screening (links a screening to an attendance record)
ALTER TABLE "Screening" ADD COLUMN IF NOT EXISTS "attendanceId" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "Screening_attendanceId_key" ON "Screening"("attendanceId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Screening_attendanceId_fkey'
    ) THEN
        ALTER TABLE "Screening" ADD CONSTRAINT "Screening_attendanceId_fkey"
            FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
