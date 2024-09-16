-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "classResultId" TEXT;

-- AlterTable
ALTER TABLE "Remark" ADD COLUMN     "classResultId" TEXT;

-- AlterTable
ALTER TABLE "SchoolStudentSkill" ADD COLUMN     "classResultId" TEXT;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classResultId_fkey" FOREIGN KEY ("classResultId") REFERENCES "ClassResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_classResultId_fkey" FOREIGN KEY ("classResultId") REFERENCES "ClassResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolStudentSkill" ADD CONSTRAINT "SchoolStudentSkill_classResultId_fkey" FOREIGN KEY ("classResultId") REFERENCES "ClassResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
