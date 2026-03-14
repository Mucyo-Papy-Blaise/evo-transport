import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';
import { PopularRoutes } from '@/components/landing/PopularRoutes';
import { Footer } from '@/components/landing/Footer';
import { TrackBooking } from '@/components/landing/TrackBooking';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <WhyChooseUs />
      <PopularRoutes />
       <TrackBooking />
      <Footer />
    </main>
  );
}