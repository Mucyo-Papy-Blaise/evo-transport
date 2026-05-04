import { TrackBooking } from '@/components/landing/TrackBooking';
import { MapBookingSection } from '@/components/booking/MapBookingSection';
import { Header } from '@/components/landing/Header';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <MapBookingSection />
      <TrackBooking />
    </main>
  );
}