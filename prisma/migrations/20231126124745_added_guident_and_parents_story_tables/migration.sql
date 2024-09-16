-- DropIndex
DROP INDEX "Behaviour_academicSessionId_key";

-- DropIndex
DROP INDEX "Behaviour_academicSessionTermId_key";

-- DropIndex
DROP INDEX "Behaviour_classId_key";

-- DropIndex
DROP INDEX "Behaviour_schoolId_key";

-- DropIndex
DROP INDEX "SchoolStudentSkill_schoolId_key";

-- AlterTable
ALTER TABLE "AcademicSession" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "AcademicSessionTerm" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "Behaviour" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "ClassSubject" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "Financial" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "Remark" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident',
ADD COLUMN     "signature" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "SchoolAnnouncement" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "SchoolAssignment" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "SchoolClass" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "SchoolClassAcademicSession" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "SchoolEvent" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "SchoolParent" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "SchoolStudent" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "SchoolStudentSkill" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "StudentAcademicSession" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "StudentAcademicSessionResult" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "TeacherInvite" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "TeacherSchool" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident',
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserToken" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Guident';

-- CreateTable
CREATE TABLE "GuidentAdmin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT 'Guident',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuidentAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentStory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "minuteRead" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guidentAdminId" TEXT NOT NULL,

    CONSTRAINT "ParentStory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuidentAdmin_id_key" ON "GuidentAdmin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GuidentAdmin_email_key" ON "GuidentAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ParentStory_id_key" ON "ParentStory"("id");

-- AddForeignKey
ALTER TABLE "ParentStory" ADD CONSTRAINT "ParentStory_guidentAdminId_fkey" FOREIGN KEY ("guidentAdminId") REFERENCES "GuidentAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
