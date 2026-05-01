-- DropIndex
DROP INDEX "Workout_date_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Workout_date_key" ON "Workout"("date");
