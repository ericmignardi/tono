import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function Tiers() {
  return (
    <section
      id="tiers"
      className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-24"
    >
      <h2 className="text-3xl font-bold">Find Your Perfect Tone.</h2>
      <p className="text-sm">
        Choose the plan that fits your journey, from casual jamming to professional tone chasing.
      </p>
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
            ? 'border-primary bg-primary-foreground flex flex-col gap-4 rounded-2xl border p-4 shadow-md'
            : 'border-border bg-primary-foreground flex flex-col gap-4 rounded-2xl border p-4 shadow-md';
          return (
            <div key={tier.name} className={cardClass}>
              <div>
                <p className="text-lg font-semibold">{tier.name}</p>
                <p className="text-2xl font-bold">
                  ${tier.price} <span className="text-base font-normal">/mo</span>
                </p>
              </div>
              <Button {...(tier.isFeatured ? {} : { variant: 'outline' })}>{tier.cta}</Button>
              <div>
                <ul className="flex flex-col gap-1">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-1">
                      <CheckCircle className="text-primary size-4" />
                      <li className="text-sm">{feature}</li>
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
