import Features from '@/components/home/Features';
import Hero from '@/components/home/Hero';
import Pricing from '@/components/home/Pricing';
import GetStarted from '@/components/home/GetStarted';

export default function Home() {
  return (
    <div className="flex w-full flex-col">
      <Hero />
      <Features />
      <Pricing />
      <GetStarted />
    </div>
  );
}
