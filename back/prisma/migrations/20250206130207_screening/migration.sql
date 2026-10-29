/*
  Warnings:

  - You are about to drop the column `medicalConsultationId` on the `ExaminationRequestForm` table. All the data in the column will be lost.
  - You are about to drop the column `medicalConsultationId` on the `ImagiologyRequestForm` table. All the data in the column will be lost.
  - You are about to drop the column `allergies` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `byExamPhysics` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `byQuestioning` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `consultationId` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosis` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `historyClinic` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `observation` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `physicsExam` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `prescription` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `reasonOfConsultation` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `MedicalConsultation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `MedicalConsultation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExaminationRequestForm" DROP CONSTRAINT "ExaminationRequestForm_medicalConsultationId_fkey";

-- DropForeignKey
ALTER TABLE "ImagiologyRequestForm" DROP CONSTRAINT "ImagiologyRequestForm_medicalConsultationId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalConsultation" DROP CONSTRAINT "MedicalConsultation_consultationId_fkey";

-- DropIndex
DROP INDEX "ExaminationRequestForm_medicalConsultationId_key";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender";

-- AlterTable
ALTER TABLE "ExaminationRequestForm" DROP COLUMN "medicalConsultationId";

-- AlterTable
ALTER TABLE "ImagiologyRequestForm" DROP COLUMN "medicalConsultationId";

-- AlterTable
ALTER TABLE "MedicalConsultation" DROP COLUMN "allergies",
DROP COLUMN "byExamPhysics",
DROP COLUMN "byQuestioning",
DROP COLUMN "consultationId",
DROP COLUMN "diagnosis",
DROP COLUMN "historyClinic",
DROP COLUMN "observation",
DROP COLUMN "physicsExam",
DROP COLUMN "prescription",
DROP COLUMN "reasonOfConsultation",
DROP COLUMN "serviceType",
DROP COLUMN "status";
