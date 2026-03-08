import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';
import { PopularTickets } from '@/components/landing/PopularTickets';
import { Steps } from '@/components/landing/Steps';
import { Insights } from '@/components/landing/Insights';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <WhyChooseUs />
      <PopularTickets />
      <Steps />
      <Insights />
      <Footer />
    </main>
  );
}