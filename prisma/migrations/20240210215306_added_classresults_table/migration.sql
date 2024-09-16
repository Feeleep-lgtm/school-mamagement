-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Behaviour" ADD COLUMN     "academicSessionResultStatusId" TEXT;

-- AlterTable
ALTER TABLE "StudentAcademicSessionResult" ADD COLUMN     "classResultId" TEXT,
ADD COLUMN     "firstApprovalStatus" "ApprovalStatus" DEFAULT 'PENDING',
ADD COLUMN     "secondApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "ClassResult" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "academicSessionTermId" TEXT NOT NULL,
    "firstApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "secondApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "company" TEXT NOT NULL DEFAULT 'Guident',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassResult_id_key" ON "ClassResult"("id");

-- AddForeignKey
ALTER TABLE "StudentAcademicSessionResult" ADD CONSTRAINT "StudentAcademicSessionResult_classResultId_fkey" FOREIGN KEY ("classResultId") REFERENCES "ClassResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassResult" ADD CONSTRAINT "ClassResult_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassResult" ADD CONSTRAINT "ClassResult_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassResult" ADD CONSTRAINT "ClassResult_academicSessionTermId_fkey" FOREIGN KEY ("academicSessionTermId") REFERENCES "AcademicSessionTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Behaviour" ADD CONSTRAINT "Behaviour_academicSessionResultStatusId_fkey" FOREIGN KEY ("academicSessionResultStatusId") REFERENCES "ClassResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
