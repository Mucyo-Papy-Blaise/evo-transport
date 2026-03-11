"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { fadeInUp, staggerContainer } from "@/utils/animations";
import { containerPadding } from "@/lib/constants/layout";
import { MapPin, Euro } from "lucide-react";
import { toast } from "@/components/ui/toast";

// Mock shuttle data for popular routes
const mockShuttles = {
  "LUX-BRU": {
    id: "popular-1",
    provider: "Royal Express",
    vehicleType: "Luxury Bus",
    departureTime: "08:00",
    arrivalTime: "10:30",
    duration: "2h 30m",
    price: 45,
    currency: "£",
    availableSeats: 12,
    amenities: ["WiFi", "AC", "Refreshments", "USB Charger"],
  },
  "FRA-LUX": {
    id: "popular-2",
    provider: "Volcano Safari",
    vehicleType: "Electric SUV",
    departureTime: "09:15",
    arrivalTime: "11:15",
    duration: "2h 00m",
    price: 55,
    currency: "£",
    availableSeats: 4,
    amenities: ["WiFi", "AC", "Water", "Charging"],
  },
  "CDG-LUX": {
    id: "popular-3",
    provider: "Kigali Express",
    vehicleType: "Minibus",
    departureTime: "10:30",
    arrivalTime: "13:00",
    duration: "2h 30m",
    price: 65,
    currency: "£",
    availableSeats: 8,
    amenities: ["AC", "USB Charger"],
  },
  "SXB-LUX": {
    id: "popular-4",
    provider: "Royal Express",
    vehicleType: "Luxury Bus",
    departureTime: "12:00",
    arrivalTime: "14:30",
    duration: "2h 30m",
    price: 35,
    currency: "£",
    availableSeats: 18,
    amenities: ["WiFi", "AC", "Refreshments"],
  },
  "AMS-BRU": {
    id: "popular-5",
    provider: "Volcano Safari",
    vehicleType: "Electric Sedan",
    departureTime: "14:00",
    arrivalTime: "16:00",
    duration: "2h 00m",
    price: 50,
    currency: "£",
    availableSeats: 3,
    amenities: ["WiFi", "AC", "Water"],
  },
  "ZRH-BSL": {
    id: "popular-6",
    provider: "Volcano Safari",
    vehicleType: "Electric SUV",
    departureTime: "15:30",
    arrivalTime: "17:00",
    duration: "1h 30m",
    price: 40,
    currency: "£",
    availableSeats: 4,
    amenities: ["WiFi", "AC", "Water"],
  },
};

const popularRoutes = [
  {
    id: 1,
    from: "Luxembourg Airport",
    to: "Brussels Airport",
    fromCode: "LUX",
    toCode: "BRU",
    price: 45,
    currency: "£",
    routeKey: "LUX-BRU",
  },
  {
    id: 2,
    from: "Frankfurt Airport",
    to: "Luxembourg City",
    fromCode: "FRA",
    toCode: "LUX",
    price: 55,
    currency: "£",
    routeKey: "FRA-LUX",
  },
  {
    id: 3,
    from: "Paris CDG",
    to: "Luxembourg",
    fromCode: "CDG",
    toCode: "LUX",
    price: 65,
    currency: "£",
    routeKey: "CDG-LUX",
  },
  {
    id: 4,
    from: "Strasbourg",
    to: "Luxembourg",
    fromCode: "SXB",
    toCode: "LUX",
    price: 35,
    currency: "£",
    routeKey: "SXB-LUX",
  },
  {
    id: 5,
    from: "Amsterdam",
    to: "Brussels",
    fromCode: "AMS",
    toCode: "BRU",
    price: 50,
    currency: "£",
    routeKey: "AMS-BRU",
  },
  {
    id: 6,
    from: "Zurich Airport",
    to: "Basel",
    fromCode: "ZRH",
    toCode: "BSL",
    price: 40,
    currency: "£",
    routeKey: "ZRH-BSL",
  },
];

// Price summary from the image
const priceSummary = [
  { city: "Luxembourg", price: 145 },
  { city: "Paris", price: 65 },
  { city: "Frankfurt", price: 55 },
  { city: "Strasbourg", price: 35 },
  { city: "Amsterdam", price: 50 },
  { city: "Zurich", price: 40 },
  { city: "Basel", price: 25 },
];

export function PopularRoutes() {
  const router = useRouter();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const handleBookNow = (route: typeof popularRoutes[0]) => {
    // Get the mock shuttle for this route
    const shuttle = mockShuttles[route.routeKey as keyof typeof mockShuttles];
    
    if (!shuttle) {
      toast.error("Route unavailable", "This route is temporarily unavailable");
      return;
    }

    // Store selected route and shuttle in sessionStorage
    sessionStorage.setItem(
      "selectedRoute",
      JSON.stringify({
        fromLocation: route.from,
        toLocation: route.to,
        fromCode: route.fromCode,
        toCode: route.toCode,
        shuttle: {
          ...shuttle,
          price: route.price, // Use the displayed price
        },
      })
    );

    // Navigate to booking page
    router.push("/booking");
  };

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Gradient Background using project colors */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-background to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-linear-to-t from-background to-transparent opacity-50" />

      {/* Floating circles */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div
        className={`mx-auto max-w-7xl ${containerPadding.default} relative z-10`}
      >
        {/* Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-block">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider px-4 py-1.5 rounded-full bg-primary/10">
              Popular Routes
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-6"
          >
            Most Booked <span className="text-primary">Destinations</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto"
          >
            Explore our most popular shuttle routes across Europe with
            competitive prices
          </motion.p>
        </motion.div>

        {/* Routes Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {popularRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              variants={fadeInUp}
              custom={index}
              whileHover={{ y: -4 }}
              className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between mb-3">
                {/* From */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">FROM</div>
                    <div className="font-semibold text-foreground">
                      {route.fromCode}
                    </div>
                  </div>
                </div>

                {/* To */}
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground text-right">
                      TO
                    </div>
                    <div className="font-semibold text-foreground text-right">
                      {route.toCode}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Route names */}
              <div className="flex justify-between text-xs text-muted-foreground mb-3">
                <span className="truncate max-w-30">{route.from}</span>
                <span className="truncate max-w-30">{route.to}</span>
              </div>

              {/* Price and Book Now */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">
                    from {route.currency}
                    {route.price}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookNow(route);
                  }}
                  className="px-4 py-1.5 rounded cursor-pointer text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Book Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Price Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Total Price Summary
              </h3>
              <p className="text-muted-foreground">
                Complete route pricing for your reference
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {priceSummary.map((item, index) => (
                <div key={index} className="text-center group">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.city}
                  </div>
                  <div className="text-lg font-bold text-primary">
                    £{item.price}
                  </div>
                  <div className="w-8 h-0.5 bg-primary/30 mx-auto mt-1 group-hover:w-12 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}