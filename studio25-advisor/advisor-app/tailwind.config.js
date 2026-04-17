/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'g-deep': '#121f04',
        'g-mid': '#446b1a',
        'g-bright': '#6f9f25',
        'g-vivid': '#7BC906',
        'g-pale': '#e8f0d8',
        'g-wash': '#f4f7ed',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Hedvig Letters Serif', 'serif'],
      },
    },
  },
  plugins: [],
}
