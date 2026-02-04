# 🎸 tono

AI-powered guitar tone assistant that generates precise amp settings for your gear.

**[Live Demo](https://tono-ruby.vercel.app)** • **[Video Walkthrough](https://www.loom.com/share/e69d2c6f43a24e4f856f5d2ccd78151d)**

---

## The Problem

**Tone chasing is expensive and frustrating.** Guitarists spend countless hours and thousands of dollars trying to recreate the tones they hear on their favorite records. Existing solutions require:

- Expensive modelers and effects pedals
- Deep technical knowledge of amp circuits and signal chains
- Owning the exact same gear as the artist

**tono solves this differently.** Instead of buying new gear, tono helps you get the most out of what you already own. Describe a tone ("early Van Halen crunch" or "SRV Texas blues"), input your guitar and amp, and AI delivers tailored settings with explanations of _why_ they work for your specific setup.

---

## Features

- 🎛️ **AI Tone Generation** — Get precise amp settings (gain, EQ, presence, reverb) based on your gear
- 🎸 **Gear-Aware Recommendations** — Adjusts for your guitar, pickups, strings, and amp type
- 📝 **Detailed Explanations** — Understand _why_ certain settings work for your desired tone
- 💳 **Freemium Model** — 5 free generations, upgrade for more
- 🔐 **Secure Auth & Payments** — Clerk authentication with Stripe subscriptions

---

## Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| **Frontend**   | Next.js 16, React 19, TypeScript |
| **Styling**    | Tailwind CSS, Shadcn/UI          |
| **Backend**    | Next.js API Routes, Prisma ORM   |
| **Database**   | PostgreSQL (Neon)                |
| **Auth**       | Clerk                            |
| **Payments**   | Stripe                           |
| **AI**         | Google Gemini                    |
| **Rate Limit** | Upstash Redis                    |
| **Hosting**    | Vercel                           |
