
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B799FF',
          600: '#A080E0'
        },
        accent: '#FF4141',
        brand: {
          DEFAULT: '#213547'
        },
        page: '#F9FAFB'
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 6px 18px rgba(33, 53, 71, 0.08)'
      }
    },
  },
  plugins: [],
};