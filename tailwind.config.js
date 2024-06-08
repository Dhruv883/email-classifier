/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#09090B",
        gray: "#27272A",
        lightGray: "#A1A1AA",
        textGray: "#9F9FA7",
      },
      fontFamily: {
        notoSans: ["Noto Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
