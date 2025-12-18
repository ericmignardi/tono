-- AlterTable
ALTER TABLE "Tone" ADD COLUMN     "audioAnalysis" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasAudioAnalysis" BOOLEAN NOT NULL DEFAULT false;
