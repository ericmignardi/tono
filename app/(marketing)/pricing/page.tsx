import FAQ from '@/components/pricing/FAQ';
import FeatureList from '@/components/pricing/FeatureList';
import Tiers from '@/components/pricing/Tiers';

export default function Pricing() {
  return (
    <div className="w-full flex-col justify-center gap-8 p-12">
      <Tiers />
      <FeatureList />
      <FAQ />
    </div>
  );
}
