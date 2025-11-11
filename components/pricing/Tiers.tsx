import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function Tiers() {
  return (
    <section id="tiers" className="section">
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl font-bold">Find Your Perfect Tone.</h2>
        <p className="text-muted-foreground text-base">
          Choose the plan that fits your journey, from casual jamming to professional tone chasing.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          {
            name: 'Free',
            price: 0,
            cta: 'Start For Free',
            isFeatured: false,
            features: [
              'Core features for beginners',
              'Access to starter tones',
              'Limited personal profiles',
            ],
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
          },
        ].map((tier) => {
          const cardClass = tier.isFeatured
            ? 'flex flex-col gap-4 rounded-2xl border border-primary p-4 shadow-md'
            : 'flex flex-col gap-4 rounded-2xl border border-border p-4 shadow-md';
          return (
            <div key={tier.name} className={cardClass}>
              <div>
                <p className="text-foreground text-lg font-semibold">{tier.name}</p>
                <p className="text-foreground text-3xl font-bold">
                  ${tier.price}{' '}
                  <span className="text-muted-foreground text-sm font-normal">/mo</span>
                </p>
              </div>
              <Button {...(tier.isFeatured ? {} : { variant: 'outline' })}>{tier.cta}</Button>
              <div>
                <ul className="flex flex-col gap-1">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-1">
                      <CheckCircle className="text-primary size-4" />
                      <li className="text-foreground text-sm">{feature}</li>
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
