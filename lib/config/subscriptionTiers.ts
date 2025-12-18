/**
 * Subscription tier configuration and helper functions
 * Uses Stripe subscription status to determine user tier
 */

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    generationsLimit: 5,
    audioAnalysisEnabled: false,
    price: 0,
    features: ['5 tone generations per month', 'Basic AI recommendations', 'Save unlimited tones'],
  },
  pro: {
    name: 'Pro',
    generationsLimit: 50,
    audioAnalysisEnabled: true,
    price: 9.99,
    features: [
      '50 tone generations per month',
      'Audio-enhanced AI analysis',
      'Priority support',
      'Advanced tone matching',
      'Save unlimited tones',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

/**
 * Check if a user can use audio analysis based on their subscription tier
 */
export function canUseAudioAnalysis(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_TIERS[tier].audioAnalysisEnabled;
}

/**
 * Get generation limit for a subscription tier
 */
export function getGenerationLimit(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS[tier].generationsLimit;
}

/**
 * Determine user's subscription tier from Stripe subscription status
 * @param hasActiveSubscription - Whether user has an active Stripe subscription
 */
export function getUserTier(hasActiveSubscription: boolean): SubscriptionTier {
  return hasActiveSubscription ? 'pro' : 'free';
}
