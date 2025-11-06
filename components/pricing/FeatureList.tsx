import { Check, X } from 'lucide-react';

export default function FeatureList() {
  return (
    <section
      id="feature-list"
      className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-24"
    >
      <h2 className="text-3xl font-bold">Compare Our Features</h2>
      <div className="bg-primary-foreground border-border rounded-2xl border p-4">
        {(() => {
          const features = [
            { name: 'Tibe Library Access', free: 'Limited', premium: 'Unlimited' },
            { name: 'Artist Tone Profiles', free: true, premium: true },
            { name: 'AI Tone Matching', free: false, premium: true },
            { name: 'Unlimited Personal Profiles', free: false, premium: true },
            { name: 'Export Options', free: false, premium: true },
            { name: 'Plugin Support', free: false, premium: true },
            { name: 'Priority Support', free: false, premium: true },
          ];

          const renderCell = (value: string | boolean) => {
            if (typeof value === 'string') return value;
            return value ? <Check className="text-primary size-4" /> : <X className="size-4" />;
          };

          return (
            <table className="table-fixed text-left">
              <thead>
                <tr className="border-b-border grid grid-cols-4 border-b">
                  <th className="col-span-2 p-2 font-medium">Feature</th>
                  <th className="col-span-1 p-2 font-medium">Free</th>
                  <th className="col-span-1 p-2 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr
                    key={feature.name}
                    className="border-b-border grid grid-cols-4 border-b last:border-b-0"
                  >
                    <td className="col-span-2 p-2">{feature.name}</td>
                    <td className="col-span-1 p-2">{renderCell(feature.free)}</td>
                    <td className="col-span-1 p-2">{renderCell(feature.premium)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>
    </section>
  );
}
