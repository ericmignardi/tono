'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function Tiers() {
  const [premiumLoading, setPremiumLoading] = useState(false);

  const tiers = [
    {
      name: 'Basic',
      price: 0,
      cta: 'Start For Free',
      isFeatured: false,
      features: [
        'Core features for beginners',
        'Access to starter tones',
        'Limited personal profiles',
      ],
      priceId: null,
    },
    {
      name: 'Premium',
      price: 9,
      cta: 'Go Premium',
      isFeatured: true,
      features: [
        'Advanced features for serious guitarists',
        'Full Artist Tone Profiles',
        'Unlimited Personal Profiles',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ?? '',
    },
  ];

  const handleSubscribe = async (priceId: string) => {
    setPremiumLoading(true);

    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Failed to start checkout. Please try again.');
      setPremiumLoading(false);
    }
  };

  return (
    <section id="tiers" className="section">
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl font-bold">Find Your Perfect Tone.</h2>
        <p className="text-muted-foreground text-base">
          Choose the plan that fits your journey, from casual jamming to professional tone chasing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tiers.map((tier) => {
          const isPremium = Boolean(tier.priceId);

          return (
            <div
              key={tier.name}
              className={`flex flex-col gap-4 rounded-2xl border p-4 shadow-md ${tier.isFeatured ? 'border-primary' : 'border-border'} `}
            >
              <div>
                <p className="text-lg font-semibold">{tier.name}</p>
                <p className="text-3xl font-bold">
                  ${tier.price}
                  <span className="text-muted-foreground text-sm font-normal">/mo</span>
                </p>
              </div>

              <Button
                {...(tier.isFeatured ? {} : { variant: 'outline' })}
                disabled={isPremium && premiumLoading}
                onClick={() => {
                  if (!isPremium) {
                    window.location.href = '/dashboard';
                    return;
                  }
                  handleSubscribe(tier.priceId!);
                }}
              >
                {premiumLoading && isPremium ? 'Loading...' : tier.cta}
              </Button>

              <ul className="flex flex-col gap-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-1 text-sm">
                    <CheckCircle className="text-primary h-4 w-4" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
