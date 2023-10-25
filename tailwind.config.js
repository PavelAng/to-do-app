/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "mainBackgroundColor": "#1c1722",
        "columnBackgroundColor": "#241c29",
        "black": "#14111B",
        "yellow": "#E6AF2E",
        "purple": "#672965"
      }
    },
  },
  plugins: [],
}

