# v1.2.0 Release Notes

## 🎵 Audio Analysis Feature

### New Capabilities

- **Audio Upload**: Pro subscribers can now upload audio files (WAV, MP3, AIFF, AAC, OGG, FLAC) up to 20MB
- **AI Audio Analysis**: Gemini 2.5 Flash analyzes uploaded audio to extract tone characteristics:
  - Genre, tempo, and energy level
  - Brightness and distortion levels
  - Frequency balance (bass, mids, treble)
  - Effects detection (reverb, delay, chorus, etc.)
  - Dynamic range analysis
- **Enhanced Tone Generation**: Audio analysis results feed into the AI to produce more accurate amp settings

### API Migration

- **Gemini Integration**: Migrated from OpenAI to Google Gemini API
- **Model Update**: Using `gemini-2.5-flash` (retired `gemini-1.5-flash`)
- **Retry Logic**: Implemented exponential backoff for 503/429 errors (1s → 2s → 4s retries)

### New Files

- `lib/gemini/gemini.ts` - Gemini client and retry utilities
- `lib/gemini/audioAnalysisService.ts` - Audio analysis functionality
- `lib/gemini/toneAiService.ts` - Enhanced tone generation with audio support
- `lib/config/subscriptionTiers.ts` - Subscription tier configuration
- `scripts/test-models.js` - Model testing utility

### Database Changes

- Added `audioAnalysis` (Json?) field to `Tone` model

### Build Improvements

- Added `postinstall` script for Prisma generation
- Updated `build` script: `npx prisma generate && next build`

### Technical Notes

- **File Size Limit**: 20MB (enforced in `validateAudioFile`)
- **Execution Timeout**: 60 seconds per request
- **Vercel Deployment**: Ensure `GEMINI_API_KEY` is set in environment variables

## Breaking Changes

None - Audio analysis is an additive feature for Pro subscribers

## Migration Notes

1. Set `GEMINI_API_KEY` in your environment variables
2. Run `npx prisma migrate dev` if on development database
3. Run `npx prisma generate` to update client types

---

**Full Changelog**: Compare v1.1.0...v1.2.0
