/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      mdx: "900px", // ✅ breakpoint personnalisé
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#06b6d4",
        dark: "#0a2540",
        gold: "#ffb800",
      },
    },
  },
  plugins: [],
};

