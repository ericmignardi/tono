'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface PricingProps {
  hasActiveSubscription?: boolean;
}

export default function Pricing({ hasActiveSubscription = false }: PricingProps) {
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const tiers = [
    {
      name: 'Basic',
      price: 0,
      cta: 'Start For Free',
      features: [
        '5 AI tone generations per month',
        'Save unlimited tones',
        'Edit and regenerate tones',
        'Basic tone library access',
      ],
      priceId: null,
    },
    {
      name: 'Pro',
      price: 9,
      cta: hasActiveSubscription ? 'Manage Subscription' : 'Upgrade to Pro',
      features: [
        '50 AI tone generations per month',
        'Save unlimited tones',
        'Edit and regenerate tones',
        'Basic tone library access',
        'Priority email support',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ?? '',
    },
  ];

  const handleSubscribe = async (priceId: string) => {
    setPremiumLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Failed to start checkout. Please try again.');
      setPremiumLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Failed to open subscription portal. Please try again.');
      setPortalLoading(false);
    }
  };

  return (
    <section id="pricing">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-12 p-8 lg:p-32">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-4xl font-bold lg:text-5xl">Simple, Transparent Pricing</h2>
          <p>
            Choose the plan that fits your journey, from casual jamming to professional tone
            chasing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tiers.map((tier) => {
            const isPremium = Boolean(tier.priceId);
            const isManageButton = isPremium && hasActiveSubscription;
            const isLoading = isPremium ? (isManageButton ? portalLoading : premiumLoading) : false;

            return (
              <Card
                key={tier.name}
                className="last:border-primary last:from-background last:via-background last:to-primary/50 flex flex-col shadow-md last:bg-linear-to-tr"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription className="text-foreground text-xl font-semibold">
                      ${tier.price}
                      <span className="text-base font-normal">/mo</span>
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4">
                  <hr />
                  <ul className="flex flex-col gap-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.priceId ? 'default' : 'outline'}
                    disabled={isLoading}
                    onClick={() => {
                      if (!isPremium) {
                        window.location.href = '/dashboard';
                        return;
                      }
                      if (isManageButton) {
                        handleManageSubscription();
                      } else {
                        handleSubscribe(tier.priceId!);
                      }
                    }}
                  >
                    {isLoading ? 'Loading...' : tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
