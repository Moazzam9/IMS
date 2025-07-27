/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nihal': {
          blue: '#0A1A2A',  // Dark navy blue from the logo
          yellow: '#FFD700', // Gold/yellow from the logo
          silver: '#C0C0C0', // Silver/gray from the logo
          'light-blue': '#E6F0FF', // Light blue for backgrounds
          'oil': '#FFB800',  // Darker gold for oil drop accent
        }
      }
    },
  },
  plugins: [],
};
