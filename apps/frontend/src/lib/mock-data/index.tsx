// lib/mock-data/index.ts
import { Wifi, Coffee, BatteryCharging } from "lucide-react";

// Location data
export const locations = [
  { code: "KGL", name: "Kigali International Airport", city: "Kigali" },
  { code: "KGL-C", name: "Kigali Central Station", city: "Kigali" },
  { code: "MZN", name: "Musanze", city: "Musanze" },
  { code: "RUB", name: "Rubavu", city: "Rubavu" },
  { code: "HYE", name: "Huye", city: "Huye" },
  { code: "KAY", name: "Kayonza", city: "Kayonza" },
  { code: "NYA", name: "Nyagatare", city: "Nyagatare" },
  { code: "RUS", name: "Rusizi", city: "Rusizi" },
];

// Distance data (in km) between locations
export const routeDistances: Record<string, number> = {
  "KGL-MZN": 95, // Kigali to Musanze
  "KGL-RUB": 150, // Kigali to Rubavu
  "KGL-HYE": 135, // Kigali to Huye
  "KGL-KAY": 110, // Kigali to Kayonza
  "KGL-NYA": 180, // Kigali to Nyagatare
  "KGL-RUS": 450, // Kigali to Rusizi
  "MZN-RUB": 60, // Musanze to Rubavu
  "HYE-RUS": 120, // Huye to Rusizi
  // Add more routes as needed
};

// Calculate distance between two locations
export const getRouteDistance = (fromCode: string, toCode: string): number => {
  const routeKey = `${fromCode}-${toCode}`;
  const reverseRouteKey = `${toCode}-${fromCode}`;
  return routeDistances[routeKey] || routeDistances[reverseRouteKey] || 0;
};

// Check if journey is long distance (>400km)
export const isLongDistance = (distance: number): boolean => {
  return distance > 400;
};

// Shuttle data for popular routes
export interface Shuttle {
  id: string;
  provider: string;
  vehicleType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  amenities: string[];
  distance?: number; // Added distance field
}

export const mockShuttles: Record<string, Shuttle> = {
  "KGL-MZN": {
    id: "route-1",
    provider: "Royal Express",
    vehicleType: "Luxury Bus",
    departureTime: "08:00",
    arrivalTime: "10:30",
    duration: "2h 30m",
    price: 15000,
    currency: "RWF",
    availableSeats: 12,
    amenities: ["WiFi", "AC", "Refreshments", "USB Charger"],
    distance: 95,
  },
  "KGL-RUB": {
    id: "route-2",
    provider: "Volcano Safari",
    vehicleType: "Electric SUV",
    departureTime: "09:15",
    arrivalTime: "11:15",
    duration: "2h 00m",
    price: 25000,
    currency: "RWF",
    availableSeats: 4,
    amenities: ["WiFi", "AC", "Water", "Charging", "Panoramic Roof"],
    distance: 150,
  },
  "KGL-HYE": {
    id: "route-3",
    provider: "Kigali Express",
    vehicleType: "Minibus",
    departureTime: "10:30",
    arrivalTime: "13:00",
    duration: "2h 30m",
    price: 12000,
    currency: "RWF",
    availableSeats: 8,
    amenities: ["AC", "USB Charger"],
    distance: 135,
  },
  "KGL-RUS": {
    id: "route-4",
    provider: "Royal Express",
    vehicleType: "Luxury Bus",
    departureTime: "12:00",
    arrivalTime: "14:30",
    duration: "2h 30m",
    price: 15000,
    currency: "RWF",
    availableSeats: 18,
    amenities: ["WiFi", "AC", "Refreshments", "USB Charger"],
    distance: 250,
  },
  "KGL-NYA": {
    id: "route-5",
    provider: "Volcano Safari",
    vehicleType: "Electric Sedan",
    departureTime: "14:00",
    arrivalTime: "16:00",
    duration: "2h 00m",
    price: 22000,
    currency: "RWF",
    availableSeats: 3,
    amenities: ["WiFi", "AC", "Water", "Charging"],
    distance: 180,
  },
};

// Popular routes display data
export interface PopularRoute {
  id: number;
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  price: number;
  currency: string;
  routeKey: string;
  distance: number;
}

export const popularRoutes: PopularRoute[] = [
  {
    id: 1,
    from: "Kigali International Airport",
    to: "Musanze",
    fromCode: "KGL",
    toCode: "MZN",
    price: 15000,
    currency: "RWF",
    routeKey: "KGL-MZN",
    distance: 95,
  },
  {
    id: 2,
    from: "Kigali International Airport",
    to: "Rubavu",
    fromCode: "KGL",
    toCode: "RUB",
    price: 25000,
    currency: "RWF",
    routeKey: "KGL-RUB",
    distance: 150,
  },
  {
    id: 3,
    from: "Kigali International Airport",
    to: "Huye",
    fromCode: "KGL",
    toCode: "HYE",
    price: 12000,
    currency: "RWF",
    routeKey: "KGL-HYE",
    distance: 135,
  },
  {
    id: 4,
    from: "Kigali International Airport",
    to: "Rusizi",
    fromCode: "KGL",
    toCode: "RUS",
    price: 15000,
    currency: "RWF",
    routeKey: "KGL-RUS",
    distance: 250,
  },
  {
    id: 5,
    from: "Kigali International Airport",
    to: "Nyagatare",
    fromCode: "KGL",
    toCode: "NYA",
    price: 22000,
    currency: "RWF",
    routeKey: "KGL-NYA",
    distance: 180,
  },
];

// Search results mock data
export const mockSearchResults = [
  {
    id: "1",
    provider: "Royal Express",
    vehicleType: "Luxury Bus",
    departureTime: "08:00",
    arrivalTime: "10:30",
    duration: "2h 30m",
    price: 15000,
    currency: "RWF",
    availableSeats: 12,
    amenities: ["WiFi", "AC", "Refreshments", "USB Charger"],
  },
  {
    id: "2",
    provider: "Volcano Safari",
    vehicleType: "Electric SUV",
    departureTime: "09:15",
    arrivalTime: "11:15",
    duration: "2h 00m",
    price: 25000,
    currency: "RWF",
    availableSeats: 4,
    amenities: ["WiFi", "AC", "Water", "Charging", "Panoramic Roof"],
  },
  {
    id: "3",
    provider: "Kigali Express",
    vehicleType: "Minibus",
    departureTime: "10:30",
    arrivalTime: "13:00",
    duration: "2h 30m",
    price: 12000,
    currency: "RWF",
    availableSeats: 8,
    amenities: ["AC", "USB Charger"],
  },
];

// Amenity icons mapping
export const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3 w-3" />,
  AC: <Coffee className="h-3 w-3" />,
  Refreshments: <Coffee className="h-3 w-3" />,
  "USB Charger": <BatteryCharging className="h-3 w-3" />,
  Charging: <BatteryCharging className="h-3 w-3" />,
  Water: <Coffee className="h-3 w-3" />,
  "Panoramic Roof": <Coffee className="h-3 w-3" />,
};