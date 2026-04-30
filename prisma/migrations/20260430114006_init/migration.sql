-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "paceSecPerKm" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "calories" INTEGER NOT NULL,
    "avgHeartRate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyComposition" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "bodyFatPct" DOUBLE PRECISION NOT NULL,
    "muscleMassKg" DOUBLE PRECISION NOT NULL,
    "visceralFat" DOUBLE PRECISION NOT NULL,
    "basalMetabolism" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyComposition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workout_date_idx" ON "Workout"("date");

-- CreateIndex
CREATE INDEX "BodyComposition_date_idx" ON "BodyComposition"("date");
