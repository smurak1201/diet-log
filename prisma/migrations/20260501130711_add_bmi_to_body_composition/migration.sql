/*
  Warnings:

  - Added the required column `bmi` to the `BodyComposition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BodyComposition" ADD COLUMN     "bmi" DOUBLE PRECISION NOT NULL;
