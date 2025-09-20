/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./Components/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'scroll-left': 'scroll-left 30s linear infinite',
        'scroll-right': 'scroll-right 30s linear infinite',
        'shine': 'shine 8s ease-in-out infinite',
        'shine-button': 'shine-button 4s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'oscillate': 'oscillate 3s ease-in-out infinite',
        'slideIn': 'slideIn 0.3s ease-out forwards',
        'rubberBand': 'rubberBand 0.8s ease-out forwards',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% / 3))' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(calc(-100% / 3))' },
          '100%': { transform: 'translateX(0)' },
        },
        shine: {
          '0%': { transform: 'translateX(-200%)', opacity: 0 },
          '20%': { opacity: 0.2 },
          '80%': { opacity: 0.2 },
          '100%': { transform: 'translateX(200%)', opacity: 0 },
        },
        'shine-button': {
          '0%': { transform: 'translateX(-150%)', opacity: 0 },
          '20%': { opacity: 0.2 },
          '80%': { opacity: 0.2 },
          '100%': { transform: 'translateX(150%)', opacity: 0 },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
        oscillate: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        rubberBand: {
          '0%': { transform: 'scale3d(1, 1, 1) translateX(100%)', opacity: '0' },
          '30%': { transform: 'scale3d(1.25, 0.75, 1) translateX(0)', opacity: '1' },
          '40%': { transform: 'scale3d(0.75, 1.25, 1)' },
          '50%': { transform: 'scale3d(1.15, 0.85, 1)' },
          '65%': { transform: 'scale3d(0.95, 1.05, 1)' },
          '75%': { transform: 'scale3d(1.05, 0.95, 1)' },
          '100%': { transform: 'scale3d(1, 1, 1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow': '0 0 15px 1px rgba(255, 255, 255, 0.2)',
        'glow-light': '0 0 15px 1px rgba(0, 0, 0, 0.1)',
      },
      screens: {
        'xs': '360px',
      },
      fontFamily: {
        'inter-tight': ['Inter Tight', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
