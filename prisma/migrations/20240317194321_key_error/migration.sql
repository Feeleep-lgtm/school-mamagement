/*
  Warnings:

  - The values [NAIARA,DOLLar] on the enum `Currency` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Currency_new" AS ENUM ('NAIRA', 'DOLLAR');
ALTER TABLE "Financial" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "Financial" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TYPE "Currency" RENAME TO "Currency_old";
ALTER TYPE "Currency_new" RENAME TO "Currency";
DROP TYPE "Currency_old";
ALTER TABLE "Financial" ALTER COLUMN "currency" SET DEFAULT 'NAIRA';
COMMIT;

-- AlterTable
ALTER TABLE "Financial" ALTER COLUMN "currency" SET DEFAULT 'NAIRA';
