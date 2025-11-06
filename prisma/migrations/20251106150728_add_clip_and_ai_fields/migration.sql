-- AlterTable
ALTER TABLE "Tone" ADD COLUMN     "aiAmpSettings" JSONB,
ADD COLUMN     "aiNotes" TEXT,
ADD COLUMN     "aiPedalChain" JSONB,
ADD COLUMN     "clipUrl" TEXT;
