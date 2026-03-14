'use client';

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fadeInUp, staggerContainer } from "@/utils/animations";
import { containerPadding } from "@/lib/constants/layout";
import { MapPin, Euro } from "lucide-react";
import { toast } from "@/components/ui/toast";

// Mock data
import { popularRoutes, mockShuttles } from "@/lib/mock-data";
import { LongDistanceModal } from "@/components/booking/LongDistanceModal";

export function PopularRoutes() {
  const router = useRouter();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  // Long distance modal state
  const [isLongDistanceModalOpen, setIsLongDistanceModalOpen] = useState(false);
  const [selectedLongRoute, setSelectedLongRoute] = useState<any>(null);

  const handleBookNow = (route: typeof popularRoutes[0]) => {
    // Get the mock shuttle for this route
    const shuttle = mockShuttles[route.routeKey as keyof typeof mockShuttles];
    
    if (!shuttle) {
      toast.error("Route unavailable", "This route is temporarily unavailable");
      return;
    }

    // Check distance rule
    if (route.distance > 400) {
      // Open long distance modal
      setSelectedLongRoute({
        fromLocation: route.from,
        toLocation: route.to,
        distance: route.distance,
      });
      setIsLongDistanceModalOpen(true);
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
        distance: route.distance,
        shuttle: {
          ...shuttle,
          price: route.price,
        },
      })
    );

    // Navigate to booking page
    router.push("/booking");
  };

  return (
    <>
      <section id="popular-routes" ref={ref} className="relative py-24 overflow-hidden">
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
              Explore our most popular shuttle routes across Rwanda with
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

                {/* Distance indicator */}
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className={`font-medium ${route.distance > 400 ? 'text-amber-600' : 'text-primary'}`}>
                    {route.distance} km
                    {route.distance > 400 && ' (Email Request)'}
                  </span>
                </div>

                {/* Price and Book Now */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4 text-primary" />
                    <span className="text-lg font-bold text-foreground">
                      {route.currency}
                      {route.price.toLocaleString()}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(route);
                    }}
                    className={`px-4 py-1.5 rounded cursor-pointer text-sm font-medium ${
                      route.distance > 400
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    } transition-colors`}
                  >
                    {route.distance > 400 ? 'Request' : 'Book Now'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Distance Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10"
          >
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-semibold text-primary">Note:</span> For journeys beyond 400 km, 
              you'll be prompted to send an email request to our admin for special arrangements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Long Distance Modal */}
      {selectedLongRoute && (
        <LongDistanceModal
          isOpen={isLongDistanceModalOpen}
          onClose={() => {
            setIsLongDistanceModalOpen(false);
            setSelectedLongRoute(null);
          }}
          fromLocation={selectedLongRoute.fromLocation}
          toLocation={selectedLongRoute.toLocation}
          distance={selectedLongRoute.distance}
        />
      )}
    </>
  );
}