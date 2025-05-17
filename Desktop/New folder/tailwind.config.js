/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define all your colors as hex values to avoid oklch/oklab
        primary: "#333333",
        secondary: "#f7f7f7",
        accent: "#f7f7f7",
        destructive: "#e53935",
        muted: "#f7f7f7",
        background: "#ffffff",
        foreground: "#252525",
        // Add any additional colors used in your theme
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
    disableColorOpacity: true, // Disable color opacity utilities that might use modern formats
  },
  corePlugins: {
    // Disable any features that might use oklch or oklab
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
  },
  plugins: [],
  // Explicitly disable modern color formats
  experimental: {
    colorFunction: false,
    disableColorFunction: true,
  },
};
