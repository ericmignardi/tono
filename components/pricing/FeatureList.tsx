import { Check, X } from 'lucide-react';

export default function FeatureList() {
  return (
    <section id="feature-list" className="section">
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl font-bold">Compare Our Features</h2>
      </div>
      <div className="border-border rounded-2xl border p-4">
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
            if (typeof value === 'string') return <span className="text-sm">{value}</span>;
            return value ? (
              <Check className="text-primary size-4" />
            ) : (
              <X className="text-muted-foreground size-4" />
            );
          };
          return (
            <table className="text-foreground table-fixed text-left">
              <thead>
                <tr className="border-b-border grid grid-cols-4 border-b">
                  <th className="col-span-2 p-2 text-base font-semibold">Feature</th>
                  <th className="col-span-1 p-2 text-base font-semibold">Free</th>
                  <th className="col-span-1 p-2 text-base font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr
                    key={feature.name}
                    className="border-b-border grid grid-cols-4 items-center border-b last:border-b-0"
                  >
                    <td className="col-span-2 p-2 text-sm">{feature.name}</td>
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
