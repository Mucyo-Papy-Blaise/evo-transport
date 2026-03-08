'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { colors } from '@/lib/constants';
import { steps } from '@/lib/constants';

export function Steps() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: colors.hmexDark }}
          >
            Book tickets in{' '}
            <span style={{ color: colors.hmexGreen }}>3 simple steps</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-lg"
            style={{ color: colors.hmexGray }}
          >
            From search to checkout — everything is designed to be fast and effortless.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={fadeInUp}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden md:block absolute top-16 left-1/2 w-full h-0.5"
                  style={{ backgroundColor: colors.hmexLightGray }}
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute inset-0 origin-left"
                    style={{ backgroundColor: colors.hmexGreen }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6"
                  style={{ backgroundColor: colors.hmexLightAqua, color: colors.hmexGreen }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.hmexDark }}>
                  {step.title}
                </h3>
                <p style={{ color: colors.hmexGray }}>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}