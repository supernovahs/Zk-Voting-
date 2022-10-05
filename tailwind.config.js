/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Silkscreen: ["sans-serif"],
      },
    },
    colors: {
      dark1: "010B12",
      dark2: "1E1F21",
      green1: "9CFF00",
      green2: "39FF13",
      green3: "0C8900",
    },
  },

  plugins: [],
};
