/*
  Warnings:

  - You are about to drop the column `academicSessionResultStatusId` on the `Behaviour` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Behaviour" DROP CONSTRAINT "Behaviour_academicSessionResultStatusId_fkey";

-- AlterTable
ALTER TABLE "Behaviour" DROP COLUMN "academicSessionResultStatusId",
ADD COLUMN     "classResultId" TEXT;

-- AddForeignKey
ALTER TABLE "Behaviour" ADD CONSTRAINT "Behaviour_classResultId_fkey" FOREIGN KEY ("classResultId") REFERENCES "ClassResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
