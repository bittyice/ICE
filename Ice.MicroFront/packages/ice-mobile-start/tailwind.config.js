/** @type {import('tailwindcss').Config} */
let rootConfig = require('../../tailwind.config');
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../ice-core/**/*.{js,jsx,ts,tsx}",
    "../ice-mobile-layout/**/*.{js,jsx,ts,tsx}",
    "../ice-mobile-psi/**/*.{js,jsx,ts,tsx}",
    "../ice-mobile-ai/**/*.{js,jsx,ts,tsx}"
  ],
  ...rootConfig
}
