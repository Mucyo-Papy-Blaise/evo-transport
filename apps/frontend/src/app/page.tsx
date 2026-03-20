import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';
import { Footer } from '@/components/landing/Footer';
import { TrackBooking } from '@/components/landing/TrackBooking';
import { MapBookingSection } from '@/components/booking/MapBookingSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <MapBookingSection />
      <WhyChooseUs />
      <TrackBooking />
      <Footer />
    </main>
  );
}