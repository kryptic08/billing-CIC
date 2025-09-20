"use client";

import { motion } from "motion/react";
import { Check, Star, Zap, Crown } from "lucide-react";

export function PricingCreative() {
  const pricingPlans = [
    {
      name: "Basic Care",
      price: "$500",
      period: "/month",
      description: "Essential healthcare for individuals",
      icon: Check,
      rotation: -6,
      features: [
        "1 monthly checkup",
        "Email support",
        "Basic health records",
        "Prescription management",
        "Emergency hotline access",
      ],
      buttonText: "Get Started",
      popular: false,
      gradient: "from-blue-500/10 to-blue-600/10",
      border: "border-blue-200 dark:border-blue-700",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      name: "Professional Care",
      price: "$1,999",
      period: "/month",
      description: "Comprehensive healthcare solution",
      icon: Star,
      rotation: 0,
      features: [
        "Unlimited checkups",
        "Priority 24/7 support",
        "Private consultation rooms",
        "Advanced diagnostics",
        "Specialist referrals",
        "Health insurance coordination",
        "Personalized care plans",
      ],
      buttonText: "Go Professional",
      popular: true,
      gradient: "from-blue-600 to-blue-600",
      border: "border-transparent",
      button: "bg-white/90 hover:bg-white text-blue-600 font-bold",
    },
    {
      name: "Enterprise Care",
      price: "Custom",
      period: "/plan",
      description: "Tailored solutions for organizations",
      icon: Crown,
      rotation: 6,
      features: [
        "Dedicated account manager",
        "Custom medication protocols",
        "Specialized treatments",
        "24/7 medical team",
        "Corporate wellness programs",
        "Group health analytics",
        "Flexible billing options",
      ],
      buttonText: "Contact Sales",
      popular: false,
      gradient: "from-purple-500/10 to-blue-600/10",
      border: "border-purple-200 dark:border-purple-700",
      button: "bg-purple-600 hover:bg-purple-700 text-white",
    },
  ];

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6 px-2">
            Choose Your Healthcare Plan
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-3 sm:px-4">
            Quality healthcare shouldn&apos;t be out of reach. Select the
            perfect plan that fits your needs and budget.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 60, rotate: plan.rotation }}
              whileInView={{
                opacity: 1,
                y: plan.popular ? -10 : 0,
                rotate: 0,
              }}
              transition={{
                type: "spring",
                duration: 0.8,
                delay: index * 0.2,
              }}
              viewport={{ once: true }}
              whileHover={{
                scale: plan.popular ? 1.02 : 1.05,
                rotate: 0,
                transition: { duration: 0.3 },
              }}
              className={`
                relative flex w-full sm:w-80 max-w-sm mx-auto flex-col rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300
                ${
                  plan.popular
                    ? `bg-gradient-to-br ${plan.gradient} text-white shadow-2xl shadow-blue-500/25 lg:scale-110 z-20 border-2 ${plan.border}`
                    : `bg-white/80 backdrop-blur-md border-2 ${plan.border} shadow-xl hover:shadow-2xl dark:bg-gray-800/80 z-10`
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 px-4 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold border-2 border-blue-200 shadow-lg"
                >
                  <Star className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 fill-current" />
                  Most Popular
                </motion.div>
              )}

              {/* Icon */}
              <div
                className={`
                inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-xl sm:rounded-2xl
                ${
                  plan.popular
                    ? "bg-white/20"
                    : "bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                }
              `}
              >
                <plan.icon
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    plan.popular ? "text-white" : "text-blue-600"
                  }`}
                />
              </div>

              {/* Plan Name */}
              <h3
                className={`text-xl sm:text-2xl font-bold mb-2 ${
                  plan.popular
                    ? "text-white"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {plan.name}
              </h3>

              {/* Description */}
              <p
                className={`text-sm mb-4 sm:mb-6 ${
                  plan.popular
                    ? "text-blue-100"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-baseline">
                  <span
                    className={`text-4xl sm:text-5xl font-black ${
                      plan.popular
                        ? "text-white"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-base sm:text-lg ml-2 ${
                      plan.popular
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 + featureIndex * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center text-sm"
                  >
                    <Check
                      className={`w-4 h-4 sm:w-5 sm:h-5 mr-3 flex-shrink-0 ${
                        plan.popular ? "text-green-300" : "text-green-500"
                      }`}
                    />
                    <span
                      className={
                        plan.popular
                          ? "text-blue-50"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    >
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-full py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300
                  ${plan.button}
                  shadow-lg hover:shadow-xl
                `}
              >
                {plan.buttonText}
              </motion.button>

              {/* Gradient overlay for popular card */}
              {plan.popular && (
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600/90 to-blue-600/90 -z-10" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4 px-3 sm:px-0">
            All plans include HIPAA compliance, secure data handling, and our
            commitment to quality care.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-blue-500" />
              Instant activation
            </span>
            <span className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              No setup fees
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
