import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        pearl: "#F9F9FB",
        ink: "#1A1A2E",
        mint: {
          soft: "#DDFBF5",
          DEFAULT: "#00C2A8",
        },
        midnight: {
          50: "#F9F9FB",
          100: "#F2F2F8",
          200: "rgba(86, 11, 173, 0.12)",
          800: "#252542",
          900: "#1A1A2E",
          950: "#150E28",
        },
        slate: {
          50: "#F9F9FB",
          100: "#F2F2F8",
          200: "rgba(86, 11, 173, 0.12)",
          300: "rgba(86, 11, 173, 0.20)",
          400: "#9999BB",
          500: "#777799",
          600: "#555577",
          700: "#333355",
          800: "#252542",
          900: "#1A1A2E",
          950: "#150E28",
        },
        indigo: {
          50: "#F2E8FF",
          100: "#E5D0FF",
          200: "#D1A7FF",
          300: "#B57BFF",
          400: "#9D4EDD",
          500: "#7209B7",
          600: "#560BAD",
          700: "#480991",
          800: "#380574",
          900: "#250250",
          950: "#150E28",
        },
        emerald: {
          50: "#DDFBF5",
          100: "#B3F6EA",
          200: "#80EEDC",
          500: "#00C2A8",
          600: "#00A892",
          700: "#008975",
          800: "#006B5C",
          900: "#004D42",
          950: "#002B25",
        },
        amber: {
          50: "#FFF4E5",
          100: "#FFE4C2",
          500: "#C66A00",
          600: "#A85800",
          700: "#8A4600",
        },
        rose: {
          50: "#FDE8EC",
          100: "#FBC6D1",
          500: "#C73752",
          600: "#A82B43",
          700: "#891F34",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        soft: "0 8px 30px -4px rgba(86, 11, 173, 0.08)",
        elevated: "0 14px 35px -6px rgba(86, 11, 173, 0.14)",
        glow: "0 0 25px -5px rgba(86, 11, 173, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
