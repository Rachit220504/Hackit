/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',     // Blue
        secondary: '#10B981',   // Green
        dark: '#1E293B',        // Slate 800
        light: '#F9FAFB',       // Gray 50
      },
    },
  },
  plugins: [
    require('autoprefixer'),
  ],
}
