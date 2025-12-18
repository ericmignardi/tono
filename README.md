# 🎸 tono - AI-Powered Guitar Tone Assistant

> **📌 Portfolio Demo Project** - This is a demonstration of full-stack development skills. The app uses Stripe test mode and Clerk development mode. Feel free to explore all features!

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://tono-ruby.vercel.app)
[![GitHub](https://img.shields.io/badge/github-source-blue?style=for-the-badge&logo=github)](https://github.com/ericmignardi/tono)

## 🧪 Try It Out

**Test Stripe Subscription:**

- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Authentication:**

- Create a free account (takes 30 seconds)
- Or just explore the landing page and features

---

## 📖 Overview

**tono** is a full-stack AI-powered SaaS application that helps guitarists achieve their desired sound instantly. Simply input your guitar and amp setup along with a creative goal like _"early Van Halen lead tone"_ or _"warm jazz clean sound"_, and tono delivers precise amp settings, effects recommendations, and detailed tone analysis.

### Why tono?

- 🎯 **Instant Results** - Get professional tone recommendations in seconds
- 🔧 **Gear-Specific** - Tailored settings for your exact equipment
- 💾 **Save Configurations** - Build your personal library of tone presets
- 🚀 **AI-Powered** - Leverages Google Gemini AI to understand musical context and translate it into technical specs

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
- **AI/ML:** Google Gemini API
- **Payments:** Stripe
- **Caching:** Vercel KV
- **Rate Limiting:** Upstash

</td>
</tr>
</table>

### Testing & Deployment

- **Unit Testing:** Jest + React Testing Library
- **E2E Testing:** Playwright
- **Hosting:** Vercel (Serverless)
- **CI/CD:** GitHub Actions

### Key Design Principles

- **Server Components First** - Fast initial page loads with optimal SEO
- **Type Safety** - End-to-end TypeScript with Prisma and Zod
- **API Protection** - Rate limiting and authentication on all endpoints
- **Caching Strategy** - Edge caching for stable data, on-demand for dynamic content

## 💰 Pricing

| Tier     | Price | Monthly Submissions | Features                                                |
| -------- | ----- | ------------------- | ------------------------------------------------------- |
| **Free** | $0    | 5                   | Basic tone generation, Save configurations              |
| **Pro**  | $9.99 | 50                  | Everything in Free, Priority support, Advanced analysis |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- API keys for:
  - [Clerk](https://clerk.com)
  - [Google AI Studio](https://aistudio.google.com/app/apikey) (Gemini API)
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
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=...
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=...
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=...
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=...

   # Database
   DATABASE_URL=postgresql://...

   # Google Gemini AI
   GEMINI_API_KEY=...

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_...

   # App URL
   NEXT_PUBLIC_URL=http://localhost:3000

   # Redis
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
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

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Start development server     |
| `npm run build`       | Build for production         |
| `npm run start`       | Start production server      |
| `npm run lint`        | Lint code with ESLint        |
| `npm run format`      | Format code with Prettier    |
| `npm run check-types` | Run TypeScript type checking |
| `npm run test`        | Run unit tests               |
| `npm run test:unit`   | Run unit tests               |
| `npm run test:e2e`    | Run end-to-end tests         |

---

## 🧪 Testing

tono uses a simplified testing strategy focused on unit tests and end-to-end tests:

```bash
# Run all unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Testing Strategy

- **Unit Tests**: Test individual functions and components in isolation
- **E2E Tests**: Test critical user flows (authentication, tone generation, subscription)
- **No Integration Tests**: Simplified setup - removed database integration tests for easier maintenance

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

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
