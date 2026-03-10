import { Suspense } from 'react';
import BookingSuccessContent from '@/components/booking/BookingSuccessContent';

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}