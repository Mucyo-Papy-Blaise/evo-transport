import { isLongDistance } from "@/lib/mock-data";

export interface BookingAction {
  type: 'direct' | 'email-request';
  message?: string;
  emailTo?: string;
  subject?: string;
}

export const handleTripDistanceRule = (distance: number): BookingAction => {
  if (isLongDistance(distance)) {
    return {
      type: 'email-request',
      message: 'This journey exceeds 400 km. Please send an email request to our admin for special arrangements.',
      emailTo: 'bookings@evotransport.rw',
      subject: 'Long Distance Trip Request',
    };
  }
  
  return {
    type: 'direct',
  };
};

// Email template for long distance requests
export const getLongDistanceEmailTemplate = (
  fromLocation: string,
  toLocation: string,
  distance: number,
  userEmail?: string
) => {
  const subject = encodeURIComponent('Long Distance Trip Request - EVO Transport');
  const body = encodeURIComponent(
    `Hello EVO Transport Team,

I would like to request a booking for a long distance trip:

📍 From: ${fromLocation}
📍 To: ${toLocation}
📏 Distance: ${distance} km

${userEmail ? `📧 Contact Email: ${userEmail}` : ''}

Please provide available options and pricing for this route.

Thank you,
EVO Transport Customer`
  );

  return `mailto:bookings@evotransport.rw?subject=${subject}&body=${body}`;
};