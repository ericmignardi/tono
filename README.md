# 🎸 Tono - AI-Powered Guitar Tone Assistant

## 📖 Overview

**Tono** is a full-stack AI-powered SaaS application that helps guitarists achieve their desired sound instantly. Simply input your guitar and amp setup along with a creative goal like _"early Van Halen lead tone"_ or _"warm jazz clean sound"_, and Tono delivers precise amp settings, effects recommendations, and detailed tone analysis.

### Why Tono?

- 🎯 **Instant Results** - Get professional tone recommendations in seconds
- 🔧 **Gear-Specific** - Tailored settings for your exact equipment
- 💾 **Save Configurations** - Build your personal library of tone presets
- 🚀 **AI-Powered** - Leverages OpenAI to understand musical context and translate it into technical specs

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
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=...
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=...
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=...
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=...

   # Database
   DATABASE_URL=postgresql://...

   # OpenAI
   OPENAI_API_KEY=sk-...

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

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `npm run dev`              | Start development server       |
| `npm run build`            | Build for production           |
| `npm run start`            | Start production server        |
| `npm run lint`             | Lint code with ESLint          |
| `npm run format`           | Format code with Prettier      |
| `npm run check-types`      | Run TypeScript type checking   |
| `npm run test`             | Run unit and integration tests |
| `npm run test:unit`        | Run unit tests                 |
| `npm run test:integration` | Run integration tests          |
| `npm run test:e2e`         | Run end-to-end tests           |

---

## 🧪 Testing

```bash
# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

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

## 🎓 Key Full-Stack Development Concepts

This project demonstrates mastery of essential full-stack development principles and modern web technologies:

### 1. **Type-Safe Full-Stack Architecture**

- **End-to-End Type Safety**: TypeScript across client, server, and database with Prisma-generated types
- **Runtime Validation**: Zod schemas for API request/response validation
- **Type Inference**: Leveraging TypeScript's type inference to reduce boilerplate
- **Generic Utilities**: Reusable type-safe utility functions and custom hooks

### 2. **Modern React Patterns**

- **Server Components**: Leveraging React Server Components for optimal performance and SEO
- **Client Components**: Strategic use of client-side interactivity where needed
- **Composition Patterns**: Building complex UIs from small, reusable components
- **Custom Hooks**: Encapsulating stateful logic (e.g., `useToast`, `useUser`)
- **Form Management**: React Hook Form with Zod validation for robust form handling

### 3. **API Design & Security**

- **RESTful Principles**: Well-structured API routes following REST conventions
- **Authentication & Authorization**: Clerk integration with middleware protection
- **Rate Limiting**: Upstash-based rate limiting to prevent abuse
- **Error Handling**: Centralized error handling with consistent API responses
- **Webhook Security**: Signature verification for Stripe and Clerk webhooks
- **Input Validation**: Server-side validation on all endpoints

### 4. **Database Design & ORM**

- **Relational Modeling**: Normalized PostgreSQL schema with proper relationships
- **Prisma ORM**: Type-safe database queries with auto-generated types
- **Migrations**: Version-controlled schema changes
- **Transaction Management**: ACID-compliant operations for critical workflows
- **Query Optimization**: Efficient queries with proper indexing and eager loading

### 5. **State Management & Caching**

- **Server State**: React Query patterns for server data synchronization
- **Client State**: React Context and hooks for UI state
- **Edge Caching**: Vercel Edge Network for static content
- **Database Caching**: Strategic use of Prisma query caching
- **Revalidation**: On-demand revalidation with Next.js `revalidatePath`

### 6. **Testing Strategy**

- **Unit Tests**: Jest for isolated component and function testing
- **Integration Tests**: Database integration tests with real Prisma client
- **E2E Tests**: Playwright for full user journey testing
- **Test Coverage**: Comprehensive coverage across critical paths
- **Mocking Strategy**: Proper mocking of external services (Stripe, OpenAI, Clerk)

### 7. **Third-Party Integrations**

- **Payment Processing**: Stripe Checkout and subscription management
- **AI/ML Integration**: OpenAI API for intelligent tone generation
- **Authentication**: Clerk for secure user management
- **Real-time Updates**: Webhook handlers for asynchronous events

### 8. **Performance Optimization**

- **Code Splitting**: Automatic route-based code splitting with Next.js
- **Image Optimization**: Next.js Image component with automatic optimization
- **Bundle Analysis**: Monitoring and optimizing bundle size
- **Lazy Loading**: Dynamic imports for heavy components
- **Edge Functions**: Serverless functions deployed to edge locations

### 9. **DevOps & Deployment**

- **CI/CD**: Automated testing and deployment with GitHub Actions
- **Environment Management**: Separate dev, test, and production environments
- **Monitoring**: Error tracking and performance monitoring
- **Serverless Architecture**: Zero-config scaling with Vercel
- **Database Hosting**: Managed PostgreSQL with Neon (serverless)

### 10. **Developer Experience**

- **TypeScript**: Full type safety across the stack
- **ESLint & Prettier**: Consistent code style and quality
- **Git Workflow**: Feature branches, pull requests, and semantic commits
- **Documentation**: Comprehensive README and inline code documentation
- **Hot Reload**: Fast refresh for rapid development

---

## 💡 Development Challenges & Solutions

Building Tono presented several interesting technical challenges that required creative problem-solving:

### Challenge 1: **Race Conditions in Credit Management**

**Problem**: Multiple concurrent API requests could consume more credits than available, leading to negative balances.

**Solution**:

- Implemented **database transactions** with Prisma's `$transaction` API
- Used **optimistic locking** by checking credits inside the transaction
- Reserved credits **before** calling the AI API to prevent waste
- Added comprehensive **integration tests** to verify concurrent request handling

```typescript
await prisma.$transaction(async (tx) => {
  const freshUser = await tx.user.findUnique({ where: { id: userId } });
  if (freshUser.generationsUsed >= freshUser.generationsLimit) {
    throw new Error('Credits exhausted');
  }
  await tx.user.update({
    where: { id: userId },
    data: { generationsUsed: { increment: 1 } },
  });
});
```

**Key Learnings**: Understanding ACID properties, transaction isolation levels, and the importance of testing concurrent scenarios.

---

### Challenge 2: **Webhook Idempotency & Duplicate Events**

**Problem**: Stripe and Clerk webhooks can send duplicate events, potentially causing double-processing of subscriptions or user updates.

**Solution**:

- Created a `webhookEvent` table to track processed events by `eventId`
- Implemented **idempotency checks** before processing any webhook
- Used database **unique constraints** to prevent duplicate entries
- Added error handling to gracefully skip already-processed events

**Key Learnings**: Importance of idempotent operations in distributed systems, webhook best practices, and defensive programming.

---

### Challenge 3: **Type-Safe AI Response Parsing**

**Problem**: OpenAI responses are unstructured JSON that could break the application if the format changed or was malformed.

**Solution**:

- Created **Zod schemas** for expected AI response structure
- Implemented **runtime validation** with fallback defaults
- Added **retry logic** with exponential backoff for API failures
- Logged malformed responses for monitoring and debugging

**Key Learnings**: Never trust external APIs, always validate at runtime, and have graceful degradation strategies.

---

### Challenge 4: **Optimizing AI Generation Costs**

**Problem**: Every tone generation costs money via OpenAI API calls, and inefficient prompts could waste tokens.

**Solution**:

- Crafted **optimized system prompts** to minimize token usage
- Implemented **intelligent caching** for similar requests
- Added **rate limiting** to prevent abuse
- Used **structured outputs** to reduce parsing complexity
- Monitored token usage and costs in production

**Key Learnings**: Cost optimization in AI applications, prompt engineering, and the importance of monitoring third-party API usage.

---

### Challenge 5: **Server vs. Client Component Boundaries**

**Problem**: Next.js 14 App Router requires careful consideration of where to use Server vs. Client Components for optimal performance.

**Solution**:

- Adopted **"Server Components by default"** principle
- Used Client Components only when needed (interactivity, hooks, browser APIs)
- Implemented **composition patterns** to minimize client-side JavaScript
- Leveraged **streaming** for faster perceived performance

**Key Learnings**: Understanding React Server Components, hydration, and the performance implications of client-side JavaScript.

---

### Challenge 6: **Testing Stripe Webhooks Locally**

**Problem**: Stripe webhooks require a public URL, making local development and testing difficult.

**Solution**:

- Used **Stripe CLI** for local webhook forwarding
- Created **mock webhook payloads** for unit tests
- Implemented **signature verification** in test environment
- Built **integration tests** that simulate webhook flows

**Key Learnings**: Local development strategies for webhook-based integrations, testing third-party integrations, and the value of good mocking.

---

### Challenge 7: **Database Schema Evolution**

**Problem**: As features evolved, the database schema needed changes without losing production data.

**Solution**:

- Used **Prisma Migrations** for version-controlled schema changes
- Wrote **data migration scripts** for complex transformations
- Implemented **backward-compatible changes** when possible
- Tested migrations on staging before production deployment

**Key Learnings**: Database migration strategies, zero-downtime deployments, and the importance of rollback plans.

---

### Challenge 8: **Handling Subscription State Transitions**

**Problem**: Stripe subscriptions have complex state transitions (active → past_due → canceled) that need to be reflected in the app.

**Solution**:

- Created a **subscription state machine** to handle all transitions
- Implemented **webhook handlers** for each Stripe event type
- Added **grace periods** for failed payments
- Built **admin tools** to manually resolve edge cases

**Key Learnings**: State machine design, webhook event ordering, and handling edge cases in payment systems.

---

### Challenge 9: **Environment-Specific Configuration**

**Problem**: Managing different configurations for development, testing, and production environments.

**Solution**:

- Centralized configuration in `lib/config.ts` with type safety
- Used **environment variables** for secrets and environment-specific values
- Created `.env.example` for documentation
- Implemented **runtime validation** of required environment variables

**Key Learnings**: Configuration management best practices, security considerations for secrets, and the importance of documentation.

---

### Challenge 10: **Balancing Feature Richness with Code Simplicity**

**Problem**: Adding features while maintaining clean, maintainable code.

**Solution**:

- Followed **SOLID principles** and clean code practices
- Extracted reusable utilities and components
- Wrote **comprehensive tests** to enable confident refactoring
- Conducted **code reviews** (even solo) before merging features
- Used **TypeScript** to catch errors at compile time

**Key Learnings**: The importance of code quality, technical debt management, and the long-term value of good architecture.

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
