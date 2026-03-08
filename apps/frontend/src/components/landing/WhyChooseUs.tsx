'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { colors } from '@/lib/constants';
import { whyChooseUs } from '@/lib/constants';

export function WhyChooseUs() {
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
            Why choose{' '}
            <span style={{ color: colors.hmexGreen }}>EVO Transport</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-lg"
            style={{ color: colors.hmexGray }}
          >
            Experience the future of transportation with our innovative features
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          {whyChooseUs.map((item, index) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="p-8 rounded-2xl transition-all hover:shadow-2xl group"
              style={{ backgroundColor: colors.hmexLightGray }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-5xl mb-6 inline-block"
              >
                {item.icon}
              </motion.div>
              <h3 
                className="text-xl font-bold mb-3 group-hover:text-primary transition-colors"
                style={{ color: colors.hmexDark }}
              >
                {item.title}
              </h3>
              <p style={{ color: colors.hmexGray }}>{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}