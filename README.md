# 🎸 tono

AI-powered guitar tone assistant that generates precise amp settings for your gear.

---

## Features

- **AI Tone Generation**: Get precise amp settings (gain, EQ, presence, reverb) tailored to your specific gear.
- **Gear-Aware Intelligence**: Recommendations adjust for your guitar model, pickup types, string gauge, and amplifier architecture.
- **Expert Explanations**: Deep-dive insights into *why* specific settings were chosen and how they interact with your signal chain.
- **Secure Infrastructure**: Enterprise-grade authentication via Clerk and production-ready payments through Stripe.
- **Traffic Optimization**: Intelligent rate limiting using Upstash Redis to ensure high availability and fair usage.

## Tech Stack

- **Next.js 16 / React 19**: Modern full-stack framework with Server Components and superior performance.
- **Google Gemini SDK**: State-of-the-art generative AI for tone analysis and parameter generation.
- **Prisma & PostgreSQL**: Robust type-safe ORM for structured gear data and user profiles.
- **Tailwind CSS & Shadcn/UI**: Highly polished, accessible, and responsive user interface components.
- **Clerk & Stripe**: Seamless identity management and subscription lifecycle orchestration.

---

## Installation & Setup

**Prerequisites:**

- Node.js 18+
- [Neon](https://neon.tech/) Database (PostgreSQL)
- [Clerk](https://clerk.com/) Account
- [Stripe](https://stripe.com/) Account
- [Google AI Studio](https://aistudio.google.com/) API Key for Gemini

```bash
# Clone the repository
git clone https://github.com/yourusername/tono.git
cd tono

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your local credentials

# Initialize database
npx prisma generate
npx prisma db push
```

## Usage

**Run Development Server:**

```bash
npm run dev
```

**Build for Production:**

```bash
npm run build
```

**Run Unit Tests:**

```bash
npm run test:unit
```

---

## Things Learned

Throughout the development of tono, several advanced full-stack and AI concepts were explored:

- **LLM Prompt Engineering**: Crafting structured JSON prompts for consistent amp setting generation.
- **RAG for Tone**: Understanding how to feed specific gear metadata into AI contexts for "gear-aware" results.
- **Serverless Architecture**: Leveraging Next.js API routes and Neon's serverless Postgres for elastic scaling.
- **Subscription Lifecycle**: Orchestrating complex Stripe webhooks with Svix for real-time tier management.
- **Performance Patterns**: Implementing optimistic UI updates and server-side streaming for a premium UX.
