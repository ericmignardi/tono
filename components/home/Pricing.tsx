'use client';

import { Button } from '@/components/ui/button';
import { Check, ArrowUpRight, Cpu, Activity } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
      toast.error('Failed to start checkout. Please try again.');
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
      toast.error('Failed to open subscription portal. Please try again.');
      setPortalLoading(false);
    }
  };

  return (
    <section id="pricing" className="px-6 py-32 bg-background border-y border-border">
      <div className="mx-auto max-w-7xl">
        <div className="mb-24">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-accent"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Subscription Tiers</span>
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tighter text-foreground md:text-6xl lg:text-7xl">
            Access <span className="text-muted-foreground/30 italic">Licenses</span>.
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground font-medium text-sm leading-relaxed opacity-60">
            Select the appropriate processing power for your production environment.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Free Tier */}
          <div className="group relative border border-border bg-card p-1 rounded-2xl transition-all duration-500 hover:border-border/80">
            <div className="p-8 pb-10">
              <div className="mb-8 flex items-center justify-between">
                <div className="h-10 w-10 flex items-center justify-center rounded border border-border bg-muted/30">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Tier 01</div>
              </div>
              
              <h3 className="font-display text-3xl font-bold text-foreground mb-1">Standard</h3>
              <div className="text-accent text-[10px] font-bold uppercase tracking-widest mb-6">Gratis</div>
              
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-[240px]">
                Essential tools for home-based practice and basic tone exploration.
              </p>

              <div className="h-px w-full bg-border/50 mb-8" />

              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Check className="h-3 w-3 text-accent" />
                  5 Process Generations
                </li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/40">
                  <span className="h-3 w-3 border border-border rounded-full" />
                  Neural Audio Analysis
                </li>
              </ul>

              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded border border-border bg-muted/20 text-[10px] font-black uppercase tracking-[0.2em] text-foreground transition-all hover:bg-muted/40"
              >
                Initialize <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="group relative border border-accent/30 bg-card p-1 rounded-2xl glow-amber transition-all duration-500 hover:border-accent/50">
            <div className="absolute -top-3 right-8 bg-accent px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest text-background">
              Recommended
            </div>
            
            <div className="p-8 pb-10">
              <div className="mb-8 flex items-center justify-between">
                <div className="h-10 w-10 flex items-center justify-center rounded border border-accent/30 bg-accent/5 glow-amber">
                  <Cpu className="h-5 w-5 text-accent" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-accent/40">Tier 02</div>
              </div>
              
              <h3 className="font-display text-3xl font-bold text-foreground mb-1">Professional</h3>
              <div className="text-accent text-[10px] font-bold uppercase tracking-widest mb-6">$9.99 / Monthly</div>
              
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-[240px]">
                High-capacity processing for professional studio and stage environments.
              </p>

              <div className="h-px w-full bg-border/50 mb-8" />

              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Check className="h-3 w-3 text-accent" />
                  50 Process Generations
                </li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Check className="h-3 w-3 text-accent" />
                  Neural Audio Analysis
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
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded bg-accent text-[10px] font-black uppercase tracking-[0.2em] text-background transition-all hover:bg-accent/90"
              >
                {premiumLoading || portalLoading
                  ? 'Processing...'
                  : hasActiveSubscription
                    ? 'Manage Subscription'
                    : 'Activate Pro License'}
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
