describe('Config Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load config successfully when all variables are present', () => {
    // Setup valid environment
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_mock',
      CLERK_SECRET_KEY: 'sk_test_mock',
      CLERK_WEBHOOK_SECRET: 'whsec_mock',
      DATABASE_URL: 'postgresql://mock:5432/db',
      OPENAI_API_KEY: 'sk-mock',
      STRIPE_SECRET_KEY: 'sk_test_stripe',
      STRIPE_WEBHOOK_SECRET: 'whsec_stripe',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_stripe',
      NEXT_PUBLIC_STRIPE_PRICE_ID_PRO: 'price_mock',
      NEXT_PUBLIC_URL: 'http://localhost:3000',
      UPSTASH_REDIS_REST_URL: 'https://mock.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'mock_token',
    };

    // Require the module to trigger validation
    const { config } = require('@/lib/config');

    expect(config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe('pk_test_mock');
    expect(config.DATABASE_URL).toBe('postgresql://mock:5432/db');
  });

  it('should throw an error if a required variable is missing', () => {
    // Setup environment with missing key
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_mock',
      // CLERK_SECRET_KEY is missing
    };

    expect(() => {
      require('@/lib/config');
    }).toThrow('Missing required environment variable: CLERK_SECRET_KEY');
  });
});
