/** @type {import('tailwindcss').Config} */
let rootConfig = require('../../tailwind.config');
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../ice-core/**/*.{js,jsx,ts,tsx}",
    "../ice-layout/**/*.{js,jsx,ts,tsx}",
    "../ice-admin/**/*.{js,jsx,ts,tsx}",
    "../ice-saas/**/*.{js,jsx,ts,tsx}",
    "../ice-ai/**/*.{js,jsx,ts,tsx}",
    "../ice-psi/**/*.{js,jsx,ts,tsx}",
    "../ice-wms/**/*.{js,jsx,ts,tsx}"
  ],
  ...rootConfig
}
