/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,jsx}",
    "./public/index.html",
    "./src/App.jsx",
  ],
  theme: {
    extend: {
      boxShadow: {
        custom: "1px 1px 10px -4px rgb(0 0 0 / 0.8)",
        newcustom: "1px 1px 10px -4px rgb(0 0 0 / 0.3)",
      },

      screens: {
        xs: { max: "388px" },
        xxs: { max: "350px" },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
  // plugins: [flowbite.plugin()],
};
