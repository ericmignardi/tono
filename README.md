# 🎸 Tono - AI-Powered Guitar Tone Assistant

<div align="center">

**Transform your creative vision into the perfect guitar tone**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

[Demo](https://tono.app) • [Documentation](https://docs.tono.app) • [Report Bug](https://github.com/ericmignardi/tono/issues) • [Request Feature](https://github.com/ericmignardi/tono/issues)

</div>

---

## 📖 Overview

**Tono** is a full-stack AI-powered SaaS application that helps guitarists achieve their desired sound instantly. Simply input your guitar and amp setup along with a creative goal like _"early Van Halen lead tone"_ or _"warm jazz clean sound"_, and Tono delivers precise amp settings, effects recommendations, and detailed tone analysis.

### Why Tono?

- 🎯 **Instant Results** - Get professional tone recommendations in seconds
- 🔧 **Gear-Specific** - Tailored settings for your exact equipment
- 💾 **Save Configurations** - Build your personal library of tone presets
- 🚀 **AI-Powered** - Leverages OpenAI to understand musical context and translate it into technical specs

---

## ✨ Features

### Core Functionality

- **🤖 AI Tone Analysis** - Translates descriptive tone requests into actionable technical configurations (gain, EQ, effects)
- **💾 Persistent Configurations** - Save and manage multiple custom amp and guitar setups
- **🎛️ Personalized Recommendations** - Tone results tailored to your specific gear
- **📊 Detailed Breakdowns** - Comprehensive explanations of why each setting works

### User Experience

- **🔐 Secure Authentication** - Powered by Clerk for seamless sign-in/sign-up
- **💳 Flexible Subscription Tiers** - Free and Pro plans managed through Stripe
- **📱 Responsive Design** - Beautiful UI across all devices
- **⚡ Fast Performance** - Optimized with edge caching and serverless architecture

---

## 🛠️ Technology Stack

<table>
<tr>
<td width="50%" valign="top">

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod

</td>
<td width="50%" valign="top">

### Backend

- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** Clerk
- **AI/ML:** OpenAI SDK
- **Payments:** Stripe
- **Caching:** Vercel KV
- **Rate Limiting:** Upstash

</td>
</tr>
</table>

### Testing & Deployment

- **Unit/Integration:** Jest + React Testing Library
- **E2E Testing:** Playwright
- **Hosting:** Vercel (Serverless)
- **CI/CD:** GitHub Actions

---

## 🏗️ Architecture

Tono follows a modern, scalable serverless architecture built on the Next.js App Router paradigm.

```
┌─────────────┐
│   Client    │
│ (React 19)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│     Next.js App Router          │
│  (Server + Client Components)   │
└──────┬──────────────────┬───────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  API Routes │    │   Prisma    │
│             │    │     ORM     │
└──────┬──────┘    └──────┬──────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   OpenAI    │    │ PostgreSQL  │
│     API     │    │   (Neon)    │
└─────────────┘    └─────────────┘
```

### Key Design Principles

- **Server Components First** - Fast initial page loads with optimal SEO
- **Type Safety** - End-to-end TypeScript with Prisma and Zod
- **API Protection** - Rate limiting and authentication on all endpoints
- **Caching Strategy** - Edge caching for stable data, on-demand for dynamic content

---

## 💰 Pricing

| Tier     | Price | Monthly Submissions | Features                                                |
| -------- | ----- | ------------------- | ------------------------------------------------------- |
| **Free** | $0    | 5                   | Basic tone generation, Save configurations              |
| **Pro**  | $9.99 | 50                  | Everything in Free, Priority support, Advanced analysis |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- API keys for:
  - [Clerk](https://clerk.com)
  - [OpenAI](https://platform.openai.com)
  - [Stripe](https://stripe.com)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ericmignardi/tono.git
   cd tono
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_WEBHOOK_SECRET=whsec_...

   # Database
   DATABASE_URL=postgresql://...

   # OpenAI
   OPENAI_API_KEY=sk-...

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_...

   # App URL
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📜 Available Scripts

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `npm run dev`         | Start development server       |
| `npm run build`       | Build for production           |
| `npm run start`       | Start production server        |
| `npm run lint`        | Lint code with ESLint          |
| `npm run format`      | Format code with Prettier      |
| `npm run check-types` | Run TypeScript type checking   |
| `npm run test`        | Run unit and integration tests |
| `npm run test:e2e`    | Run end-to-end tests           |

---

## 🧪 Testing

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

---

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tono)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables
4. Deploy!

### Post-Deployment Setup

1. **Configure webhooks:**
   - Clerk webhook: `https://yourdomain.com/api/webhooks/clerk`
   - Stripe webhook: `https://yourdomain.com/api/webhooks/stripe`

2. **Update environment variables** with production URLs

---

## 📁 Project Structure

```
tono/
├── app/                # Next.js App Router
│   ├── (app)/          # Protected dashboard & tone creation routes
│   ├── (marketing)/    # Unprotected landing & pricing routes
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/             # Shadcn/UI components
│   ├── dashboard/      # Dashboard components
│   ├── home/           # Home components
│   └── layout.tsx      # Root layout
├── lib/                # Utility functions
│   ├── db.ts           # Prisma client
│   ├── openai.ts       # OpenAI configuration
│   └── stripe.ts       # Stripe configuration
├── prisma/             # Database schema & migrations
├── public/             # Static assets
├── styles/             # Global styles
└── tests/              # Test files
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [OpenAI](https://openai.com/) - AI-powered tone analysis
- [Clerk](https://clerk.com/) - Authentication made easy
- [Stripe](https://stripe.com/) - Payment infrastructure
- [Vercel](https://vercel.com/) - Deployment platform
