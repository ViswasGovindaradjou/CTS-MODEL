/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          500: '#14b8a6',
          400: '#2dd4bf',
        }
      }
    },
  },
  plugins: [],
}
