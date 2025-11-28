'use client';

import { Button } from '@/components/ui/button';
import { Mic, Speaker, Music, Check, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

interface PricingProps {
  hasActiveSubscription?: boolean;
}

export default function Pricing({ hasActiveSubscription = false }: PricingProps) {
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

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
        body: JSON.stringify({ priceId: '' }), // Portal doesn't need priceId
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
    <section
      id="pricing"
      className="rounded-t-[3rem] bg-white px-6 py-24 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-end justify-between md:flex-row">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Choose your <span className="font-script text-primary">stage</span>
            </h2>
            <p className="mt-4 max-w-md text-slate-500">
              Plans designed for bedroom guitarists, touring pros, and studio engineers.
            </p>
          </div>
          {/* Doodle Arrow */}
          <div className="hidden pb-4 md:block">
            <svg
              className="h-12 w-24 text-slate-300"
              viewBox="0 0 100 50"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M10 40 Q 50 0 90 20"
                strokeWidth="2"
                strokeDasharray="5,5"
                markerEnd="url(#arrowhead)"
              ></path>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Free Tier */}
          <div className="group rounded-4xl bg-slate-50 p-4 pb-8 transition-all hover:shadow-xl hover:shadow-slate-200/50">
            <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-3xl border border-slate-100 bg-white">
              <Mic className="h-16 w-16 text-slate-300 transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute bottom-4 left-6 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                FREE
              </div>
            </div>
            <div className="px-4">
              <h3 className="mb-2 text-xl font-bold text-slate-900">Bedroom Rocker</h3>
              <p className="mb-6 text-sm text-slate-500">
                Perfect for learning and practicing at home.
              </p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check className="h-3 w-3" />
                  </div>{' '}
                  5 Tone Generations
                </li>
              </ul>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-200"
              >
                Get Started <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="group bg-secondary hover:shadow-primary/20 relative rounded-4xl p-4 pb-8 transition-all hover:shadow-xl">
            <div className="bg-accent absolute -top-3 right-8 z-10 rotate-3 rounded-full px-4 py-1 text-xs font-bold text-white shadow-sm">
              POPULAR
            </div>
            <div className="bg-primary/10 relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-3xl">
              <Speaker className="text-primary h-16 w-16 transition-transform duration-500 group-hover:scale-110" />
              <div className="bg-primary absolute bottom-4 left-6 rounded-full px-3 py-1 text-xs font-bold text-white">
                $9.99/mo
              </div>
            </div>
            <div className="px-4">
              <h3 className="mb-2 text-xl font-bold text-slate-900">Touring Pro</h3>
              <p className="mb-6 text-sm text-slate-500">
                Increased tone generations and exclusive features.
              </p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="bg-secondary text-primary flex h-5 w-5 items-center justify-center rounded-full">
                    <Check className="h-3 w-3" />
                  </div>{' '}
                  50 Tone Generations
                </li>
              </ul>
              <Button
                disabled={premiumLoading || portalLoading}
                onClick={() => {
                  if (hasActiveSubscription) {
                    handleManageSubscription();
                  } else {
                    handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ?? '');
                  }
                }}
                className="bg-primary shadow-primary/20 hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-6 font-semibold text-white shadow-lg transition-colors"
              >
                {premiumLoading || portalLoading
                  ? 'Loading...'
                  : hasActiveSubscription
                    ? 'Manage Subscription'
                    : 'Upgrade To Pro'}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Studio Tier */}
          {/* <div className="group rounded-4xl bg-amber-50 p-4 pb-8 transition-all hover:shadow-xl hover:shadow-amber-100">
            <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-3xl bg-amber-200">
              <Music className="h-16 w-16 text-amber-500 transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute bottom-4 left-6 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                $29/mo
              </div>
            </div>
            <div className="px-4">
              <h3 className="mb-2 text-xl font-bold text-slate-900">Studio Master</h3>
              <p className="mb-6 text-sm text-slate-500">
                High fidelity export and commercial license.
              </p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-700">
                    <Check className="h-3 w-3" />
                  </div>{' '}
                  96kHz / 24-bit
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-700">
                    <Check className="h-3 w-3" />
                  </div>{' '}
                  STEMS Separation
                </li>
              </ul>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-100 py-3 font-semibold text-amber-900 transition-colors hover:bg-amber-200">
                Go Studio <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
