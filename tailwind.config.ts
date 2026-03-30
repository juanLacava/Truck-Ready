import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7f2",
          100: "#e6eddc",
          200: "#cfdbbf",
          300: "#b1c497",
          400: "#8da36c",
          500: "#6f8650",
          600: "#586b3f",
          700: "#445332",
          800: "#38432a",
          900: "#303925",
        },
      },
    },
  },
  plugins: [],
};

export default config;
