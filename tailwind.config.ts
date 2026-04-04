import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Donker thema basis
        'bg-primary': '#0a0a0f',
        'bg-card': '#141420',
        'bg-card-hover': '#1a1a2e',
        'text-primary': '#ffffff',
        'text-secondary': '#8888aa',

        // Sport accentkleuren
        'accent-run': '#FF4444',
        'accent-bike': '#00CC66',
        'accent-swim': '#00AAFF',
        'accent-rest': '#666688',
        'accent-race': '#FFD700',

        // Intensiteitskleuren
        'intensity-easy': '#22c55e',
        'intensity-moderate': '#eab308',
        'intensity-hard': '#f97316',
        'intensity-race': '#ef4444',
      },
      backgroundColor: {
        'dark-primary': '#0a0a0f',
        'dark-card': '#141420',
        'dark-card-hover': '#1a1a2e',
      },
      textColor: {
        'dark-primary': '#ffffff',
        'dark-secondary': '#8888aa',
      },
      borderRadius: {
        'xl': '12px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 1s infinite',
      },
    },
  },
  plugins: [],
}
export default config
