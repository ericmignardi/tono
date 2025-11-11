/*
  Warnings:

  - You are about to drop the column `aiPedalChain` on the `Tone` table. All the data in the column will be lost.
  - You are about to drop the column `pedals` on the `Tone` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `Tone` table. All the data in the column will be lost.
  - Made the column `aiAmpSettings` on table `Tone` required. This step will fail if there are existing NULL values in that column.
  - Made the column `aiNotes` on table `Tone` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tone" DROP COLUMN "aiPedalChain",
DROP COLUMN "pedals",
DROP COLUMN "settings",
ALTER COLUMN "aiAmpSettings" SET NOT NULL,
ALTER COLUMN "aiNotes" SET NOT NULL;
