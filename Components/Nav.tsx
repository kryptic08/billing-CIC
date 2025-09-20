"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Shield,
  LogInIcon,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface NavLink {
  label: string;
  href: string;
  ariaLabel?: string;
}

interface NavItem {
  label: string;
  links?: NavLink[];
  href?: string;
}

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Get user on mount and listen for auth changes
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Clean logout function
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        alert("Logout failed: " + error.message);
        setIsLoggingOut(false);
        return;
      }

      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout error: " + err);
      setIsLoggingOut(false);
    }
  };

  const getFirstName = (user: SupabaseUser | null) => {
    if (!user) return null;
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName) {
      return fullName.split(" ")[0];
    }
    return user.email?.split("@")[0] || "User";
  };

  const firstName = getFirstName(user);

  const navItems: NavItem[] = [
    {
      label: "Cloud Inc. Co Departments",
      links: [
        { label: "Executive", href: "/departmemts/exevcutive" },
        { label: "Patient Records", href: "/departmemts/Patient-records" },
        { label: "Human Resources", href: "/departmemts/hr" },
        { label: "Appointment", href: "/departmemts/appointment" },
        { label: "Billing", href: "/" },
      ],
    },
    {
      label: "Group Repatotits",
      links: [
        { label: "Kirby Cope", href: "https://www.facebook.com/kirby.cope.37" },
        {
          label: "James Louie Nebria",
          href: "https://www.facebook.com/james.louie.nebria",
        },
        {
          label: "Jian Christopher So",
          href: "https://www.facebook.com/jiiiiannnn",
        },
        {
          label: "Zeus Lawrence Palmiano",
          href: "https://www.facebook.com/zeus.lawrence.9",
        },
        {
          label: "Christian Lexus Nace",
          href: "https://www.facebook.com/lexus.nace",
        },
      ],
    },
  ];

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[9998] mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg p-4">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-[9998] mx-auto max-w-7xl px-4 py-7"
    >
      <div className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg dark:border-gray-700/30 dark:bg-gray-900/10">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5" />

        <div className="relative flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <button
              onClick={() => router.push("/")}
              className="flex flex-row clickable"
            >
              <img
                src="/cloud.svg"
                alt="AI Nako Healthcare Logo"
                className="h-8 w-8 filter drop-shadow-md invert"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-200/20 bg-clip-text text-transparent clickable cursor-pointer">
                Cloud Inc Co.
              </span>
            </button>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white/20 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                >
                  <span>{item.label}</span>
                  {item.links && <ChevronDown className="h-4 w-4" />}
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {item.links && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-white/20 bg-white/90 backdrop-blur-md shadow-xl dark:border-gray-700/30 dark:bg-gray-900/90 z-[9999]"
                    >
                      <div className="p-2">
                        {item.links.map((link, linkIndex) => (
                          <motion.a
                            key={link.label}
                            href={link.href}
                            target={
                              link.href.startsWith("http") ? "_blank" : "_self"
                            }
                            rel={
                              link.href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            aria-label={link.ariaLabel}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: linkIndex * 0.05 }}
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* User Info Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 rounded-3xl bg-gradient-to-r from-blue-50/50 to-purple-50/80 backdrop-blur-sm border border-blue-200/50 px-4 py-2 transition-all duration-300 hover:from-blue-100/80 hover:to-purple-100/80"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        {firstName || "Welcome"}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-24">
                        {user?.email || "User"}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  {/* Clean User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-3xl shadow-xl overflow-hidden z-[9999]"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-800">
                            {user?.user_metadata?.full_name || firstName}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* External Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 rounded-3xl bg-red-500/50 hover:bg-red-600/65 px-4 py-4 text-sm font-medium text-white disabled:opacity-50 transition-all duration-200"
                >
                  <LogOut
                    className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`}
                  />
                  <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                </motion.button>
              </>
            ) : (
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25"
              >
                <span className="relative z-10">
                  <LogInIcon className="inline w-4 h-4 mr-2" />
                  Log In
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.a>
            )}
          </div>

          {/* Mobile Menu Button and Logout */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-1 rounded-3xl bg-red-500 hover:bg-red-600 px-4 py-1 text-sm font-medium text-white disabled:opacity-50"
              >
                <LogOut
                  className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`}
                />
                <span className="hidden">
                  {isLoggingOut ? "Signing Out..." : "Sign Out"}
                </span>
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-white/20 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-white/20 dark:border-gray-700/30"
            >
              <div className="p-4 space-y-3">
                {navItems.map((item, index) => (
                  <div key={item.label}>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {item.label}
                    </div>
                    {item.links && (
                      <div className="pl-4 space-y-1">
                        {item.links.map((link) => (
                          <motion.a
                            key={link.label}
                            href={link.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white/20 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {link.label}
                          </motion.a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-white/20 dark:border-gray-700/30">
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          Welcome, {firstName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          router.push("/admin");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-blue-50 transition-colors text-blue-600 rounded-lg"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <a
                        href="/login"
                        className="text-center rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </a>
                      <a
                        href="/login"
                        className="text-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-[9997]"
          onClick={(e) => {
            e.stopPropagation();
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </motion.nav>
  );
};

export default NavBar;
