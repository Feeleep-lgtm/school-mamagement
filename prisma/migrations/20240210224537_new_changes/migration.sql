-- AlterTable
ALTER TABLE "ClassResult" ADD COLUMN     "schoolId" TEXT;

-- AddForeignKey
ALTER TABLE "ClassResult" ADD CONSTRAINT "ClassResult_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
