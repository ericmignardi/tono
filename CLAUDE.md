# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Next.js dev server
npm run build            # prisma generate && next build
npm run lint             # ESLint on .ts/.tsx
npm run check-types      # tsc --noEmit
npm run format           # Prettier

npm test                 # full Jest suite (jsdom)
npm run test:unit        # only *.unit.test.ts (under __tests__/unit/)
npm run test:component   # only files under __tests__/component/
npm test -- <pattern>    # single file/test, e.g. `npm test -- Hero.test`
```

Prisma:

```bash
npx prisma generate                  # also runs on `npm install` (postinstall) and `npm run build`
npx prisma migrate dev --name <name>
npx prisma db push                   # for quick schema sync without a migration
```

Path alias: `@/*` resolves to repo root (`@/lib/...`, `@/components/...`).

## Architecture

Next.js 16 App Router + React 19, Clerk auth, Prisma/Postgres, Stripe billing, Google Gemini for AI, Upstash Redis for rate limiting and AI result caching.

### Route groups (`app/`)

- `app/(home)/` — public marketing site, sign-in/up. The root `/` and `/api/tones/guest` are publicly reachable so unauthenticated visitors can try one generation.
- `app/(app)/dashboard/` — authenticated user app. Anything not listed in `proxy.ts` as public requires Clerk auth.
- `app/api/` — Route handlers. The two webhook endpoints (`/api/webhooks/clerk`, `/api/webhooks/stripe`) and `/api/tones/guest` are public; everything else expects a Clerk session.

### Auth middleware lives in `proxy.ts`, NOT `middleware.ts`

This project's Clerk middleware file is named `proxy.ts` at the repo root. It defines the public-route matcher and gates the rest behind `auth.protect()`. If you add a new public route (e.g. a webhook), add it to `isPublicRoute` here.

### Tone generation flow (the core feature)

`POST /api/tones` (`app/api/tones/route.ts`) is the critical path. It enforces ordering that matters:

1. Clerk session → 401 if missing.
2. `toneRateLimit` (Upstash sliding window, 10/min per user).
3. Load user + active subscriptions from Prisma.
4. If `audioFile` is present, gate on Pro tier via `canUseAudioAnalysis()` then run `analyzeAudioTone()` (Gemini). Audio analysis is *best-effort*: if it fails, we continue with text-only generation rather than failing the request.
5. `resetCreditsIfNewPeriod()` — lazy "check-on-use" monthly reset (no cron).
6. Derive `effectiveLimit` from **current subscription state**, not from `user.generationsLimit`. The DB column can drift if a Stripe webhook (e.g. `customer.subscription.deleted`) was missed; this guard prevents a stuck Pro limit after a silent downgrade. Keep this pattern when touching credit checks.
7. Reserve a credit inside a `prisma.$transaction` *before* calling Gemini. This is the atomic check-and-decrement that prevents over-spend under concurrent requests.
8. `generateEnhancedToneSettings()` → may consult `toneCache` (Redis SHA-256 of normalized config, 30-day TTL).

`lib/gemini/toneAiService.ts` always returns a result — on Gemini failure it falls back to `DEFAULT_AMP_SETTINGS` with an explanatory note rather than throwing. Callers should not wrap it in try/catch expecting errors.

### Stripe webhook idempotency

`app/api/webhooks/stripe/route.ts` uses the `WebhookEvent` table for idempotency, but with a deliberate quirk: it skips only events where `processed=true`. If a previous delivery crashed mid-handler, `processed` stays false and Stripe's redelivery is allowed to retry. Do not "optimize" this to skip on existence — you would silently drop retries of failed events. The row is `upsert`ed at the start of each attempt to clear stale errors.

### Subscription tiers

Tiers are derived from Stripe subscription status, not stored as an enum. `lib/config/subscriptionTiers.ts` exposes `getUserTier(hasActiveSubscription)` returning `'free' | 'pro'`. Limits: free=5, pro=50 (also in `lib/config.ts` as `FREE_CREDIT_LIMIT` / `PRO_CREDIT_LIMIT` — keep these in sync if changing).

### Environment variables

`lib/config.ts` validates all required env vars **on module load** and throws if any are missing. Adding a new required var means adding it to `requiredEnvVars` *and* `.env.example`. Don't read `process.env.X` directly in route handlers — import from `@/lib/config` so a missing var fails fast at boot rather than at request time.

### Rate limiting

All Upstash rate limiters live in `lib/rateLimit.ts` with distinct prefixes (`ratelimit:tone`, `ratelimit:checkout`, `ratelimit:portal`, `ratelimit:api`). Reuse one of these rather than instantiating new `Ratelimit` objects. Note: the Upstash free-tier DB auto-deletes after inactivity, which surfaces as `fetch failed` errors in rate-limited routes — if you see this locally with no other obvious cause, the Redis instance likely needs re-creating in the Upstash console.

### Error handling for API routes

All route handlers should use the `APIError` class + `handleAPIError(error, requestId)` helper from `lib/api/errorHandler.ts`. Generate `requestId = randomUUID()` at the top of each handler, call `logRequest(...)` after auth, and let `handleAPIError` produce the JSON response. This keeps logs structured and never leaks internal errors to the client in production.

## Conventions

- Prettier: single quotes, semis, 2 spaces, 100 col, trailing commas (es5). `prettier-plugin-tailwindcss` sorts class names.
- Component library: shadcn/ui under `components/ui/` (don't hand-edit generated primitives unless intentional — re-run the shadcn generator).
- Validation: Zod schemas under `utils/validation/` (e.g. `toneValidation.ts`). Use `.safeParse` and pass `.error.issues` through `APIError`'s `parsedError`.
- Tests: `*.unit.test.ts` for pure logic (under `__tests__/unit/`), component tests under `__tests__/component/`. jsdom is the env for both.
