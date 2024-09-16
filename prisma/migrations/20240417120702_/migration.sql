/*
  Warnings:

  - You are about to drop the column `reciept` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "reciept",
ADD COLUMN     "receipt" TEXT;
