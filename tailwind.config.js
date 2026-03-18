/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      mdx: "900px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        dark: "#0a0a0a",
        gold: "#ffb800",
        primary: "#2563eb",
        secondary: "#06b6d4",
      },
    },
  },
  plugins: [],
};
