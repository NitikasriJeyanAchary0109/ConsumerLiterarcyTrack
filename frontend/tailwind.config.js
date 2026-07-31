/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",     // Indigo
        secondary: "#10B981",   // Emerald (Savings green)
        background: "#0F172A",  // Slate 900 (Sleek dark theme default)
        card: "#1E293B",        // Slate 800
        text: "#F8FAFC",        // Slate 50
        textMuted: "#94A3B8"    // Slate 400
      }
    },
  },
  plugins: [],
}
