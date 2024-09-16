/*
  Warnings:

  - You are about to drop the column `paymentType` on the `Financial` table. All the data in the column will be lost.
  - Added the required column `feeTypeId` to the `Financial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Financial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FinancialStatus" AS ENUM ('PAID', 'FAILED');

-- DropIndex
DROP INDEX "Financial_schoolId_key";

-- AlterTable
ALTER TABLE "Financial" DROP COLUMN "paymentType",
ADD COLUMN     "feeTypeId" TEXT NOT NULL,
ADD COLUMN     "receipt" TEXT,
ADD COLUMN     "status" "FinancialStatus" NOT NULL;

-- DropEnum
DROP TYPE "FinancialPaymentType";

-- CreateTable
CREATE TABLE "FinancialType" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "academicSessionTermId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "feeAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company" TEXT NOT NULL DEFAULT 'Guident',

    CONSTRAINT "FinancialType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialType_id_key" ON "FinancialType"("id");

-- AddForeignKey
ALTER TABLE "FinancialType" ADD CONSTRAINT "FinancialType_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialType" ADD CONSTRAINT "FinancialType_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialType" ADD CONSTRAINT "FinancialType_academicSessionTermId_fkey" FOREIGN KEY ("academicSessionTermId") REFERENCES "AcademicSessionTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financial" ADD CONSTRAINT "Financial_feeTypeId_fkey" FOREIGN KEY ("feeTypeId") REFERENCES "FinancialType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
