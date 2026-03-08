export const colors = {
  hmexGreen: '#0fbb7d',
  hmexDark: '#001b44',
  hmexLightAqua: '#e6f9f5',
  hmexText: '#0f172a',
  hmexGray: '#64748b',
  hmexLightGray: '#f1f5f9',
  primary: '#00b58e',
  secondary: '#001b44',
} as const;

// Mock Data - Only 3 items per section as requested
export const popularTickets = [
  {
    id: 1,
    from: 'KGL',
    fromCity: 'Kigali',
    to: 'NBO',
    toCity: 'Nairobi',
    date: '15 May 2025',
    price: 45000,
    currency: 'RWF',
  },
  {
    id: 2,
    from: 'KGL',
    fromCity: 'Kigali',
    to: 'EBB',
    toCity: 'Entebbe',
    date: '20 May 2025',
    price: 35000,
    currency: 'RWF',
  },
  {
    id: 3,
    from: 'KGL',
    fromCity: 'Kigali',
    to: 'JRO',
    toCity: 'Kilimanjaro',
    date: '25 May 2025',
    price: 55000,
    currency: 'RWF',
  },
];

export const whyChooseUs = [
  {
    id: 1,
    title: 'One Platform, All Transport',
    description: 'Book buses, electric vehicles, and airport transfers without switching apps. Everything in one seamless experience.',
    icon: '🚌',
  },
  {
    id: 2,
    title: 'Fast & Intuitive Booking',
    description: 'From search to checkout in just a few steps. Designed to minimize friction and get you booked faster.',
    icon: '⚡',
  },
  {
    id: 3,
    title: 'Secure & Reliable Payments',
    description: 'Multiple trusted payment methods with end-to-end encryption. Your data is protected at every step.',
    icon: '🔒',
  },
];

export const insights = [
  {
    id: 1,
    title: 'How EVO Transport Simplifies Your Travel',
    description: 'Discover how our platform simplifies transportation, from booking to arrival, ensuring a seamless experience.',
    date: 'Mar 8, 2026',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'The Future of Electric Vehicles in Rwanda',
    description: 'Experience the difference with our EV fleet, optimized for efficiency and sustainability.',
    date: 'Mar 5, 2026',
    readTime: '4 min read',
  },
  {
    id: 3,
    title: 'Why Choose EVO Transport for Airport Transfers',
    description: 'We\'ve been serving travelers for years, and we\'re confident in our ability to meet your needs.',
    date: 'Mar 1, 2026',
    readTime: '6 min read',
  },
];

export const steps = [
  {
    id: 1,
    title: 'Search',
    description: 'Enter your destination, date, and preferences.',
    icon: '🔍',
  },
  {
    id: 2,
    title: 'Compare',
    description: 'View options, compare prices, and choose your ride.',
    icon: '📊',
  },
  {
    id: 3,
    title: 'Book',
    description: 'Confirm and pay securely in just a few clicks.',
    icon: '✅',
  },
];