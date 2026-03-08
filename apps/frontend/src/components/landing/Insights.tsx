'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { colors } from '@/lib/constants';
import { insights } from '@/lib/constants';
import { Calendar, Clock } from 'lucide-react';

export function Insights() {
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
              Insights & <span style={{ color: colors.hmexGreen }}>Updates</span>
            </h2>
            <p style={{ color: colors.hmexGray }}>
              Stories, product insights, and tips to help you book smarter.
            </p>
          </motion.div>
          <motion.button
            variants={fadeInUp}
            whileHover={{ x: 5 }}
            className="hidden md:flex items-center font-medium"
            style={{ color: colors.hmexGreen }}
          >
            Read More <span className="ml-1">→</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {insights.map((insight) => (
            <motion.article
              key={insight.id}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="h-48" style={{ backgroundColor: colors.hmexLightGray }} />
              <div className="p-6">
                <h3 
                  className="text-xl font-bold mb-3 group-hover:text-primary transition-colors"
                  style={{ color: colors.hmexDark }}
                >
                  {insight.title}
                </h3>
                <p className="mb-4 line-clamp-2" style={{ color: colors.hmexGray }}>
                  {insight.description}
                </p>
                <div className="flex items-center text-sm" style={{ color: colors.hmexGray }}>
                  <Calendar className="h-4 w-4 mr-1" style={{ color: colors.hmexGreen }} />
                  <span className="mr-3">{insight.date}</span>
                  <Clock className="h-4 w-4 mr-1" style={{ color: colors.hmexGreen }} />
                  <span>{insight.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.button
          variants={fadeInUp}
          className="md:hidden w-full mt-8 py-3 rounded-lg font-medium"
          style={{ backgroundColor: colors.hmexGreen, color: 'white' }}
        >
          Read More
        </motion.button>
      </div>
    </section>
  );
}