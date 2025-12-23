# Tono - 5-Minute Overview Script

> Use this to practice your verbal explanation. Time yourself and adjust as needed.

---

## 🎯 Target: 5 Minutes Total

| Section                 | Time | Key Points                   |
| ----------------------- | ---- | ---------------------------- |
| Problem & Audience      | 1:00 | Pain point, who it helps     |
| What Makes It Unique    | 1:00 | AI + audio, not just presets |
| High-Level Architecture | 2:00 | Stack diagram, key decisions |
| Demo/Walkthrough        | 1:00 | Quick user journey           |

---

## Script

### Opening (15 seconds)

> "Tono is an AI-powered guitar amp settings generator. I built it as a full-stack project to demonstrate modern web development—Next.js, TypeScript, PostgreSQL, and integrations with Clerk, Stripe, and Google's Gemini AI."

---

### 1. The Problem (45 seconds)

> "**The problem:** Guitarists spend hours dialing in amp settings to match their favorite artists' tones. They watch YouTube tutorials, read forum posts, and still can't get it right—because every combination of guitar, pickups, and amp is different.
>
> **Who it's for:** Hobbyist guitarists who own a guitar and amp but don't have the ear or experience to translate 'John Mayer's clean tone' into actual knob positions.
>
> **The traditional solution:** Buy preset packs or copy settings that don't account for your specific gear. A Stratocaster through a Fender amp needs completely different settings than a Les Paul through a Marshall."

---

### 2. What Makes It Unique (1 minute)

> "Tono is different because it's **gear-aware and AI-powered**.
>
> **First**, you tell it your exact setup—guitar type, pickups, amp model. The AI adjusts recommendations based on YOUR equipment, not generic presets.
>
> **Second**, Pro users can upload a short audio clip of their target tone. Google Gemini analyzes the audio—detecting brightness, distortion level, frequency balance—and incorporates that analysis into the recommendations.
>
> **Third**, it's not just numbers. The AI explains WHY each setting works: 'Your humbuckers are high-output, so we're cutting the gain to avoid mud. The Fender amp is naturally scooped, so we're boosting mids to match Mayer's vocal midrange.'
>
> That's the value prop: **personalized, explainable amp settings based on your actual gear.**"

---

### 3. High-Level Architecture (2 minutes)

> "Let me walk you through the tech stack.
>
> **Frontend:** Next.js 15 with the App Router. I'm using React Server Components for the dashboard—data fetches on the server, streams to the client, no loading spinners. The landing page is static for SEO.
>
> **Backend:** API routes are serverless functions on Vercel. The main endpoint is POST /api/tones—it receives the gear config, optionally processes an audio file, calls Gemini, and stores the result.
>
> **Database:** PostgreSQL on NeonDB with Prisma ORM. The data model is relational—Users have Subscriptions and Tones. I'm using JSON columns for AI output so the schema stays flexible.
>
> **Authentication:** Clerk handles login, signup, and OAuth. When a user signs up, Clerk fires a webhook to my API, and I create a matching database record. Zero custom auth code.
>
> **Payments:** Stripe subscriptions with a credit system. Free users get 5 generations per month, Pro gets 50. I use Prisma transactions to atomically check and decrement credits—no race conditions.
>
> **AI:** Google Gemini 2.5 Flash for both audio analysis and tone generation. I cache results in Upstash Redis with SHA-256 keys and 30-day TTL, so identical requests don't hit the API twice.
>
> **Resilience:** Exponential backoff retry for Gemini 503s, idempotency keys for webhook deduplication, and a custom error handler that returns consistent JSON errors with codes.
>
> **Deployment:** Vercel. Git push to main, automatic deploy. Preview URLs for every PR."

---

### 4. Quick User Journey (1 minute)

> "Let me trace a user through the app.
>
> They land on the homepage, see the Hero and pricing. Click 'Get Started,' sign up with Clerk—takes 30 seconds.
>
> They're on the dashboard. Click 'Create Tone.' Fill in: 'John Mayer Gravity clean tone, Stratocaster, single-coils, Fender Twin.'
>
> If they're Pro, they can upload a 10-second audio clip of the actual song.
>
> Hit submit. My API checks their credits, calls Gemini, returns: Gain 3, Treble 6, Mid 7, Bass 4... with notes explaining each choice.
>
> The tone is saved. They can view it anytime, regenerate if needed, or create more.
>
> That's it—**gear in, personalized settings out, with AI-powered explanations.**"

---

### Closing (15 seconds)

> "That's Tono. It demonstrates full-stack skills—React Server Components, serverless APIs, relational database design, third-party integrations, and AI prompt engineering. Happy to dive into any specific area."

---

## Practice Tips

1. **Record yourself** with your phone or Loom
2. **Watch without sound first** — Is your body language confident?
3. **Watch with sound** — Are you speaking clearly? Rushing?
4. **Time each section** — Adjust if over/under
5. **Practice 3x** — First is rough, third is polished

## Common Follow-Up Questions

- "How do you handle rate limiting?"
- "What happens if Gemini is down?"
- "How did you design the credit system?"
- "Talk about a bug you fixed."

Answers are in your [ARCHITECTURE.md](file:///c:/Users/migna/Documents/tono/ARCHITECTURE.md) and [TECH_STACK.md](file:///c:/Users/migna/Documents/tono/TECH_STACK.md).
