/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
      },
      colors: {
        background: '#000000',
        'surface-100': '#1E1E1E',
        'surface-200': '#282828',
        'surface-300': '#3E3E3E',
        'primary': '#FC5200', // Strava Orange
        'primary-hover': '#E04800',
        'on-primary': '#FFFFFF',
        'on-surface': '#FFFFFF',
        'on-surface-secondary': '#A8A8A8',
        'flames': '#FF6B35',
        'flames-glow': '#F7931E',
      },
      animation: {
        'flame-pulse': 'flamePulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        flamePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    }
  },
  plugins: [],
}
