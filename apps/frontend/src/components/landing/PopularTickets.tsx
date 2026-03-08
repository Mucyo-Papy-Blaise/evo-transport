'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { colors } from '@/lib/constants';
import { popularTickets } from '@/lib/constants';
import { Calendar, DollarSign } from 'lucide-react';

export function PopularTickets() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-24" style={{ backgroundColor: colors.hmexLightAqua }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="flex justify-between items-end mb-12"
        >
          <motion.div variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.hmexDark }}>
              Popular <span style={{ color: colors.hmexGreen }}>tickets</span> right now
            </h2>
          </motion.div>
          <motion.button
            variants={fadeInUp}
            whileHover={{ x: 5 }}
            className="hidden md:flex items-center font-medium"
            style={{ color: colors.hmexGreen }}
          >
            View More <span className="ml-1">→</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {popularTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-2xl font-bold" style={{ color: colors.hmexDark }}>
                    {ticket.from}
                  </div>
                  <div className="text-sm" style={{ color: colors.hmexGray }}>
                    {ticket.fromCity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: colors.hmexDark }}>
                    {ticket.to}
                  </div>
                  <div className="text-sm" style={{ color: colors.hmexGray }}>
                    {ticket.toCity}
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed my-4" style={{ borderColor: colors.hmexLightGray }} />

              <div className="space-y-2">
                <div className="flex items-center text-sm" style={{ color: colors.hmexGray }}>
                  <Calendar className="h-4 w-4 mr-2" style={{ color: colors.hmexGreen }} />
                  {ticket.date}
                </div>
                <div className="flex items-center text-lg font-bold" style={{ color: colors.hmexGreen }}>
                  <DollarSign className="h-5 w-5" />
                  {ticket.price.toLocaleString()} {ticket.currency}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: colors.hmexGreen, color: 'white' }}
              >
                Book Now
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          variants={fadeInUp}
          className="md:hidden w-full mt-8 py-3 rounded-lg font-medium"
          style={{ backgroundColor: colors.hmexGreen, color: 'white' }}
        >
          View More
        </motion.button>
      </div>
    </section>
  );
}