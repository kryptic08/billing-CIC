"use client";
import React from "react";
import { motion } from "motion/react";
import { Heart, Shield, Clock, Users } from "lucide-react";

export function Footer() {
  const footerSections = [
    {
      title: "Cloud Inc. Co Departments",
      links: [
        { label: "Executive", href: "/departmemts/exevcutive" },
        { label: "Patient Records", href: "/departmemts/Patient-records" },
        { label: "Human Resources", href: "/departmemts/hr" },
        { label: "Appointment", href: "/departmemts/appointment" },
        { label: "Billing", href: "/" },
      ],
    },
  ];

  const features = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Providing healthcare with heart and understanding",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your health data is secure and protected",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock medical assistance",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Certified healthcare professionals",
    },
  ];

  return (
    <footer className="relative mt-12 sm:mt-20 overflow-hidden border-t border-gray-200/30">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      {/* Top Border */}
      <div className="footer-border h-px w-full" />

      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 pt-12 sm:pt-16 pb-6 sm:pb-8">
        {/* Features Section */}

        {/* Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12"
        >
          {footerSections.map((section, index) => (
            <div key={section.title}>
              <h3 className="lg:text-left text-center sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 text-center lg:text-left">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm sm:text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo and Company Info */}
            <div className="flex items-center space-x-3 text-center md:text-left">
              <div className="relative">
                <img
                  src="/globe.svg"
                  alt="Cloud Inc. Co Healthcare Logo"
                  className="h-6 w-6 sm:h-8 sm:w-8 filter drop-shadow-md"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-sm" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cloud Inc. Co Healthcare
                </span>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Curing with heart and compassion
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-right text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <p>&copy; 2025 Cloud Inc. Co Healthcare. All rights reserved.</p>
              <p className="mt-1">
                Licensed healthcare provider • HIPAA compliant
              </p>
              <p className="mt-1">
                Fullstacked system by
                <span
                  onClick={() => window.open("https://kirbycope.com", "_blank")}
                  className="ml-1 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:underline"
                >
                  {" "}
                  kirbycope.com
                </span>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="featured-yellow-highlight-bg bottom-0" />
    </footer>
  );
}
