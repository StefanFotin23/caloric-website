// Shared Tailwind Play CDN config for all 3 Caloric pages (index.html,
// daikin.html, value.html). Single source of truth for brand colors,
// fonts and shadows — edit here once instead of in 3 separate <script>
// blocks. Loaded via <script src="assets/tailwind-config.js"> right after
// the Tailwind CDN <script> tag, before any page-specific <style>.
tailwind.config = {
  darkMode: 'media', // follows the visitor's OS/browser prefers-color-scheme automatically
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ice: {
          50: '#eff8ff',
          100: '#dbeffe',
          200: '#bfe4fe',
          300: '#93d3fd',
          400: '#5fb9fa',
          500: '#3a9df3',
          600: '#2680e8',
          700: '#1f68d4',
          800: '#2054ab',
          900: '#1e2f4d',
          950: '#0f1a2e',
        },
        ember: {
          50: '#fff5ed',
          100: '#ffe7d3',
          200: '#ffcaa5',
          300: '#ffa66d',
          400: '#ff7a33',
          500: '#fd570f',
          600: '#ee3d05',
          700: '#c52a08',
          800: '#9c220f',
          900: '#7e1f10',
        },
      },
      boxShadow: {
        nav: '0 4px 20px -2px rgba(15, 26, 46, 0.08)',
      },
    },
  },
};
