-- AlterEnum
ALTER TYPE "StudentStatus" ADD VALUE 'OUT';

-- AlterTable
ALTER TABLE "SchoolStudent" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
