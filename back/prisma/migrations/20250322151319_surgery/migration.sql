-- AlterTable
ALTER TABLE "Internment" ADD COLUMN     "status" "ObservationStage" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "Surgery" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "observation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Surgery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
