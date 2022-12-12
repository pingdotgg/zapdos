/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
const typography = require("./tailwind.typography.config");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography,
      colors: {
        gray: {
          ...colors.zinc,
          750: "#333338",
          850: "#202023",
          950: "#0C0C0E",
        },
        pink: {
          50: "#FEE6F0",
          100: "#FDCDE1",
          200: "#F1A5C6",
          300: "#ED8AB5",
          400: "#E96EA4",
          500: "#E24A8D",
          600: "#DB1D70",
          700: "#C01A62",
          800: "#A41654",
          900: "#6E0F38",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "fade-in-delay": {
          "0%": {
            opacity: "0",
          },
          "50%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-down": "fade-in-down 0.5s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-in-delay": "fade-in-delay 1s ease-out",
      },
      backgroundSize: {
        landing: "120rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
