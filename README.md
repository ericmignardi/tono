# 🎸 tono - AI-Powered Guitar Tone Assistant

<div align="center">

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://tono-ruby.vercel.app)
[![Loom Demo](https://img.shields.io/badge/loom-video_demo-blueviolet?style=for-the-badge&logo=loom)](https://www.loom.com/share/e69d2c6f43a24e4f856f5d2ccd78151d)
[![GitHub](https://img.shields.io/badge/github-source-blue?style=for-the-badge&logo=github)](https://github.com/ericmignardi/tono)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel&logoColor=white)

</div>

> **📌 Portfolio Demo** — This is a production-ready SaaS application showcasing full-stack development skills. Uses Stripe test mode for payments and Clerk development mode for auth.

---

## 🎯 What It Does

**tono** transforms how guitarists achieve their desired sound. Input your gear setup and describe a tone ("early Van Halen lead" or "warm jazz clean"), and AI delivers precise amp settings with detailed explanations.

### The Problem I Solved

As a developer and musician, I spent countless hours tweaking amp settings to recreate specific tones. Existing solutions either require deep technical knowledge or expensive equipment. **tono** bridges this gap with AI-powered recommendations tailored to your exact gear.

---

## 🔥 Technical Highlights

### Production-Ready API Architecture

The application features secure, rate-limited API routes with comprehensive error handling:

```typescript
// From: app/api/tones/route.ts - Real production code
export async function POST(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const user = await currentUser();
    if (!user) {
      throw new APIError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Redis-backed rate limiting (Upstash)
    const { success } = await toneRateLimit.limit(user.id);
    if (!success) {
      throw new APIError(
        'Too many tone generation requests. Please slow down.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Database transaction for credit reservation
    await prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: dbUser.id },
        select: { generationsUsed: true, generationsLimit: true },
      });

      if (!freshUser || freshUser.generationsUsed >= freshUser.generationsLimit) {
        throw new APIError(
          'No remaining credits. Please upgrade your plan.',
          403,
          'CREDITS_EXHAUSTED'
        );
      }

      await tx.user.update({
        where: { id: dbUser.id },
        data: { generationsUsed: { increment: 1 } },
      });
    });

    // AI-powered tone generation
    const aiResult = await generateEnhancedToneSettings(gearConfig, audioAnalysis);

    return NextResponse.json({ message: 'Successfully created tone', tone }, { status: 201 });
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}
```

### AI Integration with Prompt Engineering

Custom prompt engineering translates musical concepts into technical specifications:

```typescript
// From: lib/gemini/toneAiService.ts - Actual AI service
const SYSTEM_PROMPT = `You are a guitar tone engineer. Provide SPECIFIC amp settings for the given gear.

Output ONLY valid JSON:
{
  "ampSettings": {
    "gain": number (0-10, 0.5 increments),
    "treble": number (0-10, 0.5 increments),
    "mid": number (0-10, 0.5 increments),
    "bass": number (0-10, 0.5 increments),
    "volume": number (0-10, 0.5 increments),
    "presence": number (0-10, 0.5 increments),
    "reverb": number (0-10, 0.5 increments)
  },
  "notes": string (2-3 sentences on WHY these settings work)
}

REQUIREMENTS:
1. Analyze full gear: guitar, pickups (single-coil vs humbucker), strings, amp type
2. Match tone description: bright/dark, compressed/dynamic, clean/overdriven
3. Adjust for amp characteristics (British/American, tube/solid-state)
4. Humbuckers need less gain; single-coils may need mid boost
5. Base on artist's documented settings when possible, adapt to provided gear`;
```

### Stripe Webhook Handling with Idempotency

Robust payment processing with replay attack prevention:

```typescript
// From: app/api/webhooks/stripe/route.ts - Production webhook handler
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  // Signature verification
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, config.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new NextResponse('Webhook signature verification failed', { status: 400 });
  }

  // Replay attack prevention
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id },
  });

  if (existingEvent) {
    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
  }

  // Record event before processing
  await prisma.webhookEvent.create({
    data: { eventId: event.id, type: event.type, processed: false },
  });

  // Handle subscription lifecycle events
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionChange(subscription, 'created');
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionChange(subscription, 'updated');
      break;
    case 'customer.subscription.deleted':
      // Downgrade user to free tier
      await prisma.user.update({
        where: { id: user.id },
        data: { generationsLimit: FREE_CREDIT_LIMIT },
      });
      break;
  }
}
```

### Rate Limiting Strategy

Multiple rate limiters for different operation types:

```typescript
// From: lib/rateLimit.ts - Production rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// AI generation (expensive operation)
export const toneRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ratelimit:tone',
});

// Checkout (prevent abuse)
export const checkoutRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'ratelimit:checkout',
});

// General API (read operations)
export const apiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'ratelimit:api',
});
```

---

## 🛠️ Technology Stack

<table>
<tr>
<td width="50%" valign="top">

### Frontend

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (98.4% coverage)
- **Styling:** Tailwind CSS + Shadcn/UI
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod

</td>
<td width="50%" valign="top">

### Backend

- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Authentication:** Clerk
- **AI:** Google Gemini API
- **Payments:** Stripe
- **Rate Limiting:** Upstash Redis

</td>
</tr>
</table>

### Database Schema

```prisma
// From: prisma/schema.prisma
model User {
  id               String         @id @default(cuid())
  clerkId          String         @unique
  email            String         @unique
  stripeId         String?        @unique
  generationsUsed  Int            @default(0)
  generationsLimit Int            @default(5)
  tones            Tone[]
  subscriptions    Subscription[]
}

model Tone {
  id            String   @id @default(cuid())
  user          User     @relation(fields: [userId], references: [id])
  userId        String
  name          String
  artist        String
  description   String
  guitar        String
  pickups       String
  amp           String
  aiAmpSettings Json
  aiNotes       String
  audioAnalysis Json?
  @@index([userId, createdAt])
}

model Subscription {
  id               String    @id @default(cuid())
  stripeId         String    @unique
  status           String
  priceId          String
  currentPeriodEnd DateTime?
  user             User      @relation(fields: [userId], references: [id])
}
```

---

## 💼 Skills Demonstrated

| Category         | Technologies & Patterns                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| **Frontend**     | React Server Components, TypeScript, Tailwind CSS, Form validation with Zod |
| **Backend**      | RESTful APIs, Prisma ORM, Webhook processing, Rate limiting                 |
| **Database**     | PostgreSQL, Relational schema design, Connection pooling, Migrations        |
| **Integrations** | Clerk Auth, Stripe Payments, Google Gemini AI                               |
| **DevOps**       | GitHub Actions CI/CD, Vercel deployment, Environment management             |
| **Testing**      | Jest unit tests, Playwright E2E tests                                       |

---

## 🧪 Try It Out

**[Live Demo →](https://tono-ruby.vercel.app)**

**Test Payment (Stripe Test Mode):**

- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

## 📊 Architecture Overview

```
User Request → Next.js App Router → Clerk Auth Middleware
                                          ↓
                               API Route Handler
                                          ↓
                    ┌─────────────────────┼─────────────────────┐
                    ↓                     ↓                     ↓
             Rate Limiter           Zod Validation        Credits Check
             (Upstash Redis)                              (Prisma Transaction)
                                          ↓
                               Google Gemini AI
                                          ↓
                               PostgreSQL (Neon)
                                          ↓
                               JSON Response
```

---

## 🚀 Local Development

```bash
# Clone and install
git clone https://github.com/ericmignardi/tono.git
cd tono && npm install

# Configure environment
cp .env.example .env.local
# Add your API keys for Clerk, Stripe, Gemini, Neon, Upstash

# Database setup
npx prisma migrate dev && npx prisma generate

# Run development server
npm run dev
```

### Available Scripts

| Command               | Description              |
| --------------------- | ------------------------ |
| `npm run dev`         | Start development server |
| `npm run build`       | Production build         |
| `npm run test`        | Run Jest unit tests      |
| `npm run test:e2e`    | Run Playwright E2E tests |
| `npm run lint`        | ESLint check             |
| `npm run check-types` | TypeScript validation    |

---

## 💰 Subscription Model

| Tier     | Price | Monthly Generations | Features                                 |
| -------- | ----- | ------------------- | ---------------------------------------- |
| **Free** | $0    | 5                   | Text-based tone generation               |
| **Pro**  | $9.99 | 50                  | Audio file analysis, Priority processing |

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built by Eric Mignardi**

[Live Demo](https://tono-ruby.vercel.app) • [GitHub](https://github.com/ericmignardi/tono) • [LinkedIn](https://linkedin.com/in/ericmignardi)

</div>
