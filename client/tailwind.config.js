/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e3a5f', foreground: '#ffffff', light: '#2d5490', dark: '#152a45' },
        secondary: { DEFAULT: '#f59e0b', foreground: '#1e3a5f' },
        accent: { DEFAULT: '#e74c3c', foreground: '#ffffff' },
        success: { DEFAULT: '#10b981', foreground: '#ffffff' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: { sans: ['Inter', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
