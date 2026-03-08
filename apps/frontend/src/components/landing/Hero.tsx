'use client';

import { motion } from 'framer-motion';
import { colors } from '@/lib/constants';
import { containerPadding } from '@/lib/constants/layout';
import { ArrowRight, MapPin, Calendar, Users, Briefcase } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="/bus.png" 
          alt="Bus background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay */}
      </div>

      <div className={`mx-auto max-w-7xl w-full ${containerPadding.default} relative z-10`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              One platform for <br />
              <span style={{ color: colors.hmexGreen }}>every ticket</span> you need
            </h1>
            
            <p className="mt-4 text-lg text-white/90 max-w-lg">
              One place for all your ticket booking needs.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 inline-flex items-center px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-xl"
              style={{
                backgroundColor: colors.hmexGreen,
                color: 'white',
              }}
            >
              Find tickets now
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>

          {/* Right Content - Flight Ticket Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md ml-auto w-full"
          >
            {/* Flight Ticket Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold" style={{ color: colors.hmexDark }}>
                Flight Ticket
              </h2>
              <p className="text-sm" style={{ color: colors.hmexGray }}>
                Let&apos;s explore the World now!
              </p>
            </div>

            {/* From - To Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.hmexGray }}>
                  FROM
                </label>
                <div className="mt-1">
                  <div className="text-2xl font-bold" style={{ color: colors.hmexDark }}>
                    SYD
                  </div>
                  <div className="text-xs" style={{ color: colors.hmexGray }}>
                    Sydney, Australia
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.hmexGray }}>
                  TO
                </label>
                <div className="mt-1">
                  <div className="text-2xl font-bold" style={{ color: colors.hmexDark }}>
                    NYC
                  </div>
                  <div className="text-xs" style={{ color: colors.hmexGray }}>
                    New York, US
                  </div>
                </div>
              </div>
            </div>

            {/* Details Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.hmexGray }}>
                  DEPARTURE
                </label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" style={{ color: colors.hmexGreen }} />
                  <span className="text-sm font-medium" style={{ color: colors.hmexDark }}>
                    March 12, 2025
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.hmexGray }}>
                  PASSENGER
                </label>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-1" style={{ color: colors.hmexGreen }} />
                  <span className="text-sm font-medium" style={{ color: colors.hmexDark }}>
                    1 Person
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.hmexGray }}>
                  CLASS
                </label>
                <div className="flex items-center mt-1">
                  <Briefcase className="h-4 w-4 mr-1" style={{ color: colors.hmexGreen }} />
                  <span className="text-sm font-medium" style={{ color: colors.hmexDark }}>
                    Business
                  </span>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg font-medium transition-all hover:shadow-lg"
              style={{
                backgroundColor: colors.hmexGreen,
                color: 'white',
              }}
            >
              Search Flights
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Optional: Bottom gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}