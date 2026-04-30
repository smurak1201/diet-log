-- DropIndex
DROP INDEX "BodyComposition_date_idx";

-- AlterTable
ALTER TABLE "Workout" ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(0);

-- CreateIndex
CREATE UNIQUE INDEX "BodyComposition_date_key" ON "BodyComposition"("date");

