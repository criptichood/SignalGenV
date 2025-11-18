/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  safelist: [
    // Add common Tailwind classes that might be generated dynamically
    {
      pattern: /bg-(red|green|blue|purple|orange|cyan)-(100|200|300|400|500|600|700)/,
    },
    {
      pattern: /text-(red|green|blue|purple|orange|cyan)-(100|200|300|400|500|600|700)/,
    },
    {
      pattern: /border-(red|green|blue|purple|orange|cyan)-(100|200|300|400|500|600|700)/,
    },
    {
      pattern: /hover:bg-(red|green|blue|purple|orange|cyan)-(100|200|300|400|500|600|700)/,
    },
    // Safelist for opacity variants
    {
      pattern: /bg-cyan-500\/\d+/,
    },
    {
      pattern: /bg-gray-\d+\/\d+/,
    },
    {
      pattern: /text-gray-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /text-cyan-(100|200|300|400|500|600|700)/,
    },
    {
      pattern: /focus:ring-(red|green|blue|purple|orange|cyan)-(100|200|300|400|500|600|700)/,
    },
    {
      pattern: /data-\[state\=selected\]:bg-gray-\d+/,
    },
    {
      pattern: /hover:bg-gray-(700|800)/,
    },
    {
      pattern: /hover:bg-gray-700\/\d+/,
    },
    {
      pattern: /hover:bg-(purple|cyan)-500\/\d+/,
    },
  ],
}