ALTER TABLE "Service" ADD COLUMN "revisitAfterDays" INTEGER NOT NULL DEFAULT 30;

ALTER TABLE "Customer" ADD COLUMN "expectedRevisitDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "Customer" ADD COLUMN "lifecycleStatus" TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE "Appointment" ADD COLUMN "serviceItems" JSONB;
ALTER TABLE "Appointment" ADD COLUMN "serviceStartedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN "serviceEndedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

CREATE INDEX "Customer_tenantId_lifecycleStatus_idx" ON "Customer"("tenantId", "lifecycleStatus");
CREATE INDEX "Customer_tenantId_lastVisitAt_idx" ON "Customer"("tenantId", "lastVisitAt");
CREATE INDEX "Appointment_tenantId_status_idx" ON "Appointment"("tenantId", "status");
