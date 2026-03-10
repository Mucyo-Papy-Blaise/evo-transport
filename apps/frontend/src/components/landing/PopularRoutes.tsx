"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/utils/animations";
import { containerPadding } from "@/lib/constants/layout";
import { MapPin, Euro } from "lucide-react";

const popularRoutes = [
  {
    id: 1,
    from: "Luxembourg Airport",
    to: "Brussels Airport",
    fromCode: "LUX",
    toCode: "BRU",
    price: 45,
    currency: "£",
  },
  {
    id: 2,
    from: "Frankfurt Airport",
    to: "Luxembourg City",
    fromCode: "FRA",
    toCode: "LUX",
    price: 55,
    currency: "£",
  },
  {
    id: 3,
    from: "Paris CDG",
    to: "Luxembourg",
    fromCode: "CDG",
    toCode: "LUX",
    price: 65,
    currency: "£",
  },
  {
    id: 4,
    from: "Strasbourg",
    to: "Luxembourg",
    fromCode: "SXB",
    toCode: "LUX",
    price: 35,
    currency: "£",
  },
  {
    id: 5,
    from: "Amsterdam",
    to: "Brussels",
    fromCode: "AMS",
    toCode: "BRU",
    price: 50,
    currency: "£",
  },
  {
    id: 6,
    from: "Zurich Airport",
    to: "Basel",
    fromCode: "ZRH",
    toCode: "BSL",
    price: 40,
    currency: "£",
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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
              className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border hover:border-primary/30 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5"
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
