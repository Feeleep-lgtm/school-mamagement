-- AlterTable
ALTER TABLE "FinancialType" ADD COLUMN     "classId" TEXT;

-- AddForeignKey
ALTER TABLE "FinancialType" ADD CONSTRAINT "FinancialType_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
