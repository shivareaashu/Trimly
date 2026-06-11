const fs = require('fs');
const path = require('path');

const srcImages = {
  'logo.png': 'C:\\Users\\wagho\\.gemini\\antigravity-ide\\brain\\a9d3774a-db49-4a1d-afbd-2bd3336a5c25\\trimly_logo_1780506824784.png',
  'salon_interior.png': 'C:\\Users\\wagho\\.gemini\\antigravity-ide\\brain\\a9d3774a-db49-4a1d-afbd-2bd3336a5c25\\salon_interior_1780506845321.png',
  'client_styling.png': 'C:\\Users\\wagho\\.gemini\\antigravity-ide\\brain\\a9d3774a-db49-4a1d-afbd-2bd3336a5c25\\client_styling_1780506860676.png',
  'reception.png': 'C:\\Users\\wagho\\.gemini\\antigravity-ide\\brain\\a9d3774a-db49-4a1d-afbd-2bd3336a5c25\\reception_1780506881116.png',
  'dashboard-preview.png': 'C:\\Users\\wagho\\.gemini\\antigravity-ide\\brain\\a9d3774a-db49-4a1d-afbd-2bd3336a5c25\\dashboard_preview_1780506897970.png'
};

const destDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

Object.entries(srcImages).forEach(([name, srcPath]) => {
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(destDir, name);
    let shouldCopy = true;
    if (fs.existsSync(destPath)) {
      const srcStat = fs.statSync(srcPath);
      const destStat = fs.statSync(destPath);
      if (srcStat.size === destStat.size) {
        shouldCopy = false;
      }
    }
    if (shouldCopy) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${name} to public/images/`);
      } catch (err) {
        console.error(`Failed to copy ${name}:`, err);
      }
    }
  }
});

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
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
        // Standard HSL mappings for dark mode dashboard and components
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
        // Premium gold theme for Trimly
        gold: {
          50: '#fbf9f1',
          100: '#f5f0db',
          200: '#eadfae',
          300: '#dac778',
          400: '#cca848',
          500: '#bf8d30',
          600: '#a36d24',
          700: '#83501f',
          800: '#6b3f1f',
          900: '#5c331e',
          950: '#341a0e',
        },
        // Custom Stitch design colors for Trimly India Landing Page
        "on-primary-fixed": "#241a00",
        "primary-fixed-dim": "#e9c349",
        "on-tertiary": "#ffffff",
        "surface-container-low": "#f6f3f2",
        "outline-variant": "#d0c5af",
        "outline": "#7f7663",
        "surface-tint": "#735c00",
        "tertiary-container": "#b3b3af",
        "secondary-fixed": "#e3e3de",
        "inverse-primary": "#e9c349",
        "surface-container-highest": "#e5e2e1",
        "on-secondary-fixed": "#1b1c19",
        "on-surface": "#1c1b1b",
        "tertiary-fixed": "#e3e2de",
        "secondary-fixed-dim": "#c7c7c2",
        "on-tertiary-container": "#444543",
        "on-primary-container": "#554300",
        "surface-bright": "#fcf9f8",
        "surface-dim": "#dcd9d9",
        "on-secondary-fixed-variant": "#464744",
        "surface": "#fcf9f8",
        "on-background": "#1c1b1b",
        "inverse-on-surface": "#f3f0ef",
        "on-secondary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "on-error-container": "#93000a",
        "on-secondary-container": "#646561",
        "on-primary-fixed-variant": "#574500",
        "error-container": "#ffdad6",
        "error": "#ba1a1a",
        "surface-container-high": "#eae7e7",
        "inverse-surface": "#313030",
        "on-tertiary-fixed-variant": "#464744",
        "secondary-container": "#e3e3de",
        "on-tertiary-fixed": "#1b1c1a",
        "tertiary": "#5e5f5c",
        "on-error": "#ffffff",
        "on-primary": "#ffffff",
        "surface-variant": "#e5e2e1",
        "primary-container": "#d4af37",
        "on-surface-variant": "#4d4635",
        "primary-fixed": "#ffe088",
        "surface-container": "#f0eded",
        "tertiary-fixed-dim": "#c7c6c3",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "unit": "8px",
        "margin-mobile": "20px",
        "container-max": "1440px",
        "gutter": "24px",
        "margin-desktop": "64px",
      },
      fontFamily: {
        "headline-md": ["var(--font-bodoni)", "serif"],
        "headline-lg-mobile": ["var(--font-bodoni)", "serif"],
        "headline-lg": ["var(--font-bodoni)", "serif"],
        "label-md": ["var(--font-hanken)", "sans-serif"],
        "body-md": ["var(--font-hanken)", "sans-serif"],
        "body-lg": ["var(--font-hanken)", "sans-serif"],
        "label-sm": ["var(--font-hanken)", "sans-serif"],
        "display-lg": ["var(--font-bodoni)", "serif"],
      },
      fontSize: {
        "headline-md": [
          "28px",
          {
            "lineHeight": "1.3",
            "fontWeight": "500",
          },
        ],
        "headline-lg-mobile": [
          "32px",
          {
            "lineHeight": "1.2",
            "fontWeight": "500",
          },
        ],
        "headline-lg": [
          "40px",
          {
            "lineHeight": "1.2",
            "letterSpacing": "-0.01em",
            "fontWeight": "500",
          },
        ],
        "label-md": [
          "14px",
          {
            "lineHeight": "1.2",
            "letterSpacing": "0.08em",
            "fontWeight": "600",
          },
        ],
        "body-md": [
          "16px",
          {
            "lineHeight": "1.5",
            "fontWeight": "400",
          },
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "1.6",
            "letterSpacing": "0.01em",
            "fontWeight": "400",
          },
        ],
        "label-sm": [
          "12px",
          {
            "lineHeight": "1.2",
            "letterSpacing": "0.05em",
            "fontWeight": "500",
          },
        ],
        "display-lg": [
          "64px",
          {
            "lineHeight": "1.1",
            "letterSpacing": "-0.02em",
            "fontWeight": "600",
          },
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
