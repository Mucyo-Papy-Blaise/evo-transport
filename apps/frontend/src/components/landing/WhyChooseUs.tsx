'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, slideInLeft, slideInRight } from '@/utils/animations';
import { containerPadding } from '@/lib/constants/layout';
import { Shield, Clock, DollarSign, Truck } from 'lucide-react';

const whyChooseUsData = [
  {
    id: 1,
    title: 'Safe & Secure',
    description: 'Fully licensed drivers and insured vehicles for your peace of mind',
    icon: Shield,
  },
  {
    id: 2,
    title: 'Always On Time',
    description: '98% on-time arrival rate with real-time tracking',
    icon: Clock,
  },
  {
    id: 3,
    title: 'Best Prices',
    description: 'Competitive rates with no hidden fees or surcharges',
    icon: DollarSign,
  },
  {
    id: 4,
    title: 'Modern Fleet',
    description: 'Comfortable, clean, and well-maintained vehicles',
    icon: Truck,
  },
];

export function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className={`mx-auto max-w-7xl ${containerPadding.default}`}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Side - Headline & Description */}
          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            className="lg:sticky lg:top-24"
          >
            <motion.div variants={fadeInUp} className="inline-block">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Why choose us
              </span>
            </motion.div>
            
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 leading-tight"
            >
              Your Trusted Partner in{' '}
              <span className="text-primary">Transportation</span>
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground mt-6 leading-relaxed max-w-md"
            >
              With expertise in shuttle services and electric vehicles, we&apos;re here to guide you towards seamless travel experiences across Rwanda.
            </motion.p>

            {/* Decorative line */}
            <motion.div 
              variants={fadeInUp}
              className="w-20 h-1 bg-primary/30 rounded-full mt-8"
            />
          </motion.div>

          {/* Right Side - Features List */}
          <motion.div
            variants={slideInRight}
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            className="space-y-10"
          >
            {whyChooseUsData.map((item, index) => {
              const Icon = item.icon;
              
              return (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  custom={index}
                  className="group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      {/* Underline */}
                      <div className="w-12 h-0.5 bg-primary/50 mb-3 group-hover:w-16 transition-all duration-300" />
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Optional bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-8 border-t border-border"
        >
          {[
            { value: '500+', label: 'Daily Rides' },
            { value: '98%', label: 'On-Time Rate' },
            { value: '50+', label: 'Modern Fleet' },
            { value: '24/7', label: 'Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}