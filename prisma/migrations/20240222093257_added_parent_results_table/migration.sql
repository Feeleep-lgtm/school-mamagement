-- AlterTable
ALTER TABLE "ClassResult" ADD COLUMN     "parentApprovalStatus" "ApprovalStatus" DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "StudentAcademicSessionResult" ADD COLUMN     "parentApprovalStatus" "ApprovalStatus" DEFAULT 'PENDING',
ALTER COLUMN "secondApprovalStatus" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ParentResults" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "academicSessionTermId" TEXT NOT NULL,
    "reportCard" JSONB NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "approved" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
    "company" TEXT NOT NULL DEFAULT 'Guident',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentAcademicSessionId" TEXT,

    CONSTRAINT "ParentResults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentResults_id_key" ON "ParentResults"("id");

-- CreateIndex
CREATE INDEX "ParentResults_parentId_classId_academicSessionId_academicSe_idx" ON "ParentResults"("parentId", "classId", "academicSessionId", "academicSessionTermId", "studentId");

-- AddForeignKey
ALTER TABLE "ParentResults" ADD CONSTRAINT "ParentResults_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentResults" ADD CONSTRAINT "ParentResults_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentResults" ADD CONSTRAINT "ParentResults_academicSessionTermId_fkey" FOREIGN KEY ("academicSessionTermId") REFERENCES "AcademicSessionTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentResults" ADD CONSTRAINT "ParentResults_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentResults" ADD CONSTRAINT "ParentResults_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentResults" ADD CONSTRAINT "ParentResults_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentResults" ADD CONSTRAINT "ParentResults_studentAcademicSessionId_fkey" FOREIGN KEY ("studentAcademicSessionId") REFERENCES "StudentAcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
