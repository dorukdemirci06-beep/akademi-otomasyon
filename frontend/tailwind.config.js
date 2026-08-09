/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2eb82e',
          hover: '#269926',
          light: '#eaf8ea',
        },
        secondary: {
          DEFAULT: '#ff8c1a',
          hover: '#e67300',
          light: '#fff4e6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
