const requiredEnvVars = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_PRICE_ID_PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
} as const;

// Validate on module load
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const config = requiredEnvVars as Record<keyof typeof requiredEnvVars, string>;

// Allowed Stripe price IDs (add more as needed)
export const ALLOWED_PRICE_IDS = [
  config.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
  // Add other price IDs here
  // process.env.STRIPE_PRICE_ID_ENTERPRISE,
].filter(Boolean);

// Credit limits
export const FREE_CREDIT_LIMIT = 5;
export const PRO_CREDIT_LIMIT = 50;
