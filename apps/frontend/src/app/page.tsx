import { TrackBooking } from '@/components/landing/TrackBooking';
import { MapBookingSection } from '@/components/booking/MapBookingSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <MapBookingSection />
      <TrackBooking />
    </main>
  );
}