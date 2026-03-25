"use client";

import { motion } from "framer-motion";
import { containerPadding } from "@/lib/constants/layout";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  quickLinks: [
    { label: "Why Choose Us", href: "/#why-choose-us" },
    { label: "Popular Routes", href: "/#popular-routes" },
    { label: "Track Booking", href: "/#track-booking" },
  ],
  social: [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-linear-to-b from-background to-secondary/5 border-t border-border w-full">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div
        className={`mx-auto max-w-7xl ${containerPadding.default} relative z-10 w-full`}
      >
        {/* Main Footer Content - All sections in one line */}
        <div className="flex flex-wrap justify-between gap-8 lg:gap-12 py-16 w-full">
          {/* Brand & Contact Section */}
          <div className="flex-1 min-w-[280px] space-y-6">
            <Link href="/" className="inline-block group">
              <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                EVO<span className="text-primary">Transport</span>
              </h2>
              <div className="w-12 h-0.5 bg-primary/50 mt-1 group-hover:w-20 transition-all duration-300" />
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              One place for all your transport booking needs. Safe, reliable,
              and eco-friendly travel across Rwanda.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-muted-foreground">
                  Schuman Roundabout, 2-4 (EU Quarter) 1040 Brussels
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-muted-foreground">+3224033758</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-muted-foreground">
                  tinsiamanasseh@yahoo.fr
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex-1 min-w-[160px]">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
                    scroll={link.href.includes("#")}
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 mr-2 transition-all -translate-x-2 group-hover:translate-x-0" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="flex-1 min-w-[160px]">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Follow Us
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {footerLinks.social.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#7fe284] hover:text-black transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-center  w-full">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} EVO Transport. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
