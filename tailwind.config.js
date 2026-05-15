/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'gns-blue': '#1e3a8a',    // Bleu Sombre (Confiance/GNS)
        'ul-green': '#16a34a',    // Vert (Université/Succès)
        'alert-red': '#dc2626'    // Rouge pour les rejets
      }
    },
  },
  plugins: [],
}

