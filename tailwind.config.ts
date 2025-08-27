import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        // Enhanced Yasinga brand colors
        'yasinga': {
          'primary': 'hsl(214, 84%, 56%)',
          'primary-dark': 'hsl(214, 84%, 46%)',
          'secondary': 'hsl(197, 71%, 52%)',
          'secondary-dark': 'hsl(197, 71%, 42%)',
          'success': 'hsl(142, 71%, 45%)',
          'warning': 'hsl(38, 92%, 50%)',
          'error': 'hsl(0, 72%, 51%)',
          'slate': {
            50: 'hsl(210, 40%, 98%)',
            100: 'hsl(210, 40%, 96%)',
            200: 'hsl(214, 32%, 91%)',
            300: 'hsl(213, 27%, 84%)',
            400: 'hsl(215, 20%, 65%)',
            500: 'hsl(215, 25%, 52%)',
            600: 'hsl(215, 28%, 42%)',
            700: 'hsl(215, 32%, 32%)',
            800: 'hsl(220, 26%, 14%)',
            900: 'hsl(220, 39%, 11%)',
          }
        },
        // Wave Accounting inspired colors
        'wave': {
          'blue': {
            50: '#f0f9ff',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
          },
          'teal': {
            50: '#f0fdfa',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
          },
          'slate': {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            500: '#64748b',
            700: '#334155',
            800: '#1e293b',
          }
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["Charter", "BitStream Charter", "Sitka Text", "Cambria", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "Monaco", "monospace"],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
