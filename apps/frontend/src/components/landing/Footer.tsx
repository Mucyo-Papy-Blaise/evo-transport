'use client';

import { motion } from 'framer-motion';
import { colors } from '@/lib/constants';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-16" style={{ backgroundColor: colors.hmexDark }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-white">
              EVO<span style={{ color: colors.hmexGreen }}>Transport</span>
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.hmexLightGray }}>
              One place for all your transport booking needs.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm" style={{ color: colors.hmexLightGray }}>
                <MapPin className="h-4 w-4 mr-2" style={{ color: colors.hmexGreen }} />
                Kigali, Rwanda
              </div>
              <div className="flex items-center text-sm" style={{ color: colors.hmexLightGray }}>
                <Phone className="h-4 w-4 mr-2" style={{ color: colors.hmexGreen }} />
                +250 788 123 456
              </div>
              <div className="flex items-center text-sm" style={{ color: colors.hmexLightGray }}>
                <Mail className="h-4 w-4 mr-2" style={{ color: colors.hmexGreen }} />
                info@evotransport.rw
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {['About Us', 'Services', 'Contact', 'FAQ'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: colors.hmexLightGray }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'Terms of Service', 'Privacy Policy', 'Safety'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: colors.hmexLightGray }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Download App</h4>
            <p className="text-sm mb-4" style={{ color: colors.hmexLightGray }}>
              Get the EVO Transport app for the best experience
            </p>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-white/10 backdrop-blur-sm"
                style={{ color: 'white' }}
              >
                App Store
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-white/10 backdrop-blur-sm"
                style={{ color: 'white' }}
              >
                Google Play
              </motion.button>
            </div>
          </div>
        </div>

        <div 
          className="mt-12 pt-8 text-center border-t"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <p className="text-sm" style={{ color: colors.hmexLightGray }}>
            © 2026 EVO Transport. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}