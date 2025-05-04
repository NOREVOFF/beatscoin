/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        beatsOrange: "#ff7a00",
        beatsGreen: "#00ffbf"
      },
      dropShadow: {
        neon: "0 0 20px #ff7a00"
      }
    }
  },
  plugins: []
}
