'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { containerPadding } from "@/lib/constants/layout";

;

export function Hero() {

  return (
    <>
      <section className="relative min-h-screen flex items-center pt-10 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/eco-bus.png"
            alt="background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className={`mx-auto max-w-7xl w-full ${containerPadding.default} relative z-10`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Book Your Shuttle <br />
                <span className="text-header-bg bg-white p-2 px-4 mt-2">with Ease</span>
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-lg">
                Greenbus, your bus and electric car transport service in Brussels and its surroundings
              </p>
            </motion.div>

          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-linear-to-t from-background to-transparent" />
      </section>
    </>
  );
}