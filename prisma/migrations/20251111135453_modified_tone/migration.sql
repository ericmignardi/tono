/*
  Warnings:

  - Made the column `description` on table `Tone` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pickups` on table `Tone` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tone" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "pickups" SET NOT NULL;
