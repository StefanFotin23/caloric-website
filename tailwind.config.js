/**
 * Tailwind CLI config — single source of truth for the site color palette,
 * font, and shadow tokens (previously duplicated inline in 3 <script> blocks,
 * then centralized in assets/tailwind-config.js for the Play CDN; this file
 * is that same palette's new home now that Tailwind compiles at build time
 * instead of in the visitor's browser).
 */
module.exports = {
  content: [
    "./src/**/*.njk",
    "./src/**/*.html",
    "./src/assets/*.js",
  ],
  darkMode: "media", // follows the visitor's OS/browser prefers-color-scheme automatically
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ice: {
          50: "#eff8ff",
          100: "#dbeffe",
          200: "#bfe4fe",
          300: "#93d3fd",
          400: "#5fb9fa",
          500: "#3a9df3",
          600: "#2680e8",
          700: "#1f68d4",
          800: "#2054ab",
          900: "#1e2f4d",
          950: "#0f1a2e",
        },
        ember: {
          50: "#fff5ed",
          100: "#ffe7d3",
          200: "#ffcaa5",
          300: "#ffa66d",
          400: "#ff7a33",
          500: "#fd570f",
          600: "#ee3d05",
          700: "#c52a08",
          800: "#9c220f",
          900: "#7e1f10",
        },
      },
      boxShadow: {
        nav: "0 4px 20px -2px rgba(15, 26, 46, 0.08)",
      },
    },
  },
  plugins: [],
};
