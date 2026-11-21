/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#10242B',
        teal: {
          DEFAULT: '#0F4C5C',
          dark: '#0A3844',
          light: '#E6F0F2',
        },
        accent: {
          DEFAULT: '#B84A0B',
          soft: '#FBEBDD',
          dark: '#8A3600',
        },
        muted: '#4A5F66',
        border: {
          DEFAULT: '#D5E0E3',
          teal: '#B9CDD2',
        },
        'alt-bg': '#F6F8F8',
        'body-teal': '#33484F',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        telugu: ['"Noto Sans Telugu"', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1160px',
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
    },
  },
  plugins: [],
}
