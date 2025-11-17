import Features from '@/components/home/Features';
import Hero from '@/components/home/Hero';
import Pricing from '@/components/home/Pricing';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex-col justify-between gap-8">
      <Hero />
      <Features />
      <Pricing />
    </div>
  );
}
