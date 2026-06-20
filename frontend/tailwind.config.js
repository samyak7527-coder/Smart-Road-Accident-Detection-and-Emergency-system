/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B132B',      // Rich dark space blue
          navy: '#1C2541',      // Deep navy blue
          blue: '#3A506B',      // Secondary slate blue
          light: '#F8F9FA',     // Off white
          red: '#E63946',       // Vibrant emergency red
          crimson: '#D90429',   // Deep crimson alert red
          accent: '#00F5D4',    // Clean bright teal for status indications
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
