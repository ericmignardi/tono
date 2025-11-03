import Features from '@/components/home/Features';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';

export default function Home() {
  return (
    <div className="w-full flex-col justify-center gap-8 p-12">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
    </div>
  );
}
