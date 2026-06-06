/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          gold: '#D4A574',
          light: '#E8C9A0',
          dark: '#B8956A',
        },
        ink: {
          blue: '#1A1F3D',
          light: '#2D3561',
          dark: '#0F1429',
        },
        spirit: {
          purple: '#8B5CF6',
          green: '#10B981',
          wisdom: '#6366F1',
          vitality: '#F59E0B',
          healing: '#EC4899',
          fantasy: '#8B5CF6',
          guardian: '#10B981',
        },
      },
      fontFamily: {
        song: ['LXGW WenKai', 'Noto Serif SC', 'serif'],
        hei: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'particle': 'particle 8s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        particle: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translate(100px, -100px) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}