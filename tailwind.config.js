/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        PURPLE: "#c418ac",
        landingBG: "#f4def1",
        textColor: "#d9d9d9",
        inputColor: "#D9D9D9",
        BLUE: "#2d2065",
        courseText: "#d5d2e0",
        grayBG: "#e8e2e2"
      }
    },
  },
  // plugins: [require("daisyui")],
}

