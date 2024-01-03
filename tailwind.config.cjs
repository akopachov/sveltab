/** @type {import('tailwindcss').Config}*/
const { skeleton } = require('@skeletonlabs/tw-plugin');
const { addDynamicIconSelectors } = require('@iconify/tailwind');

/** @type {import('tailwindcss').Config}*/
const config = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    require('path').join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}'),
  ],
  darkMode: 'class',

  theme: {
    extend: {},
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    addDynamicIconSelectors(),
    skeleton({ themes: { preset: ['skeleton'] } }),
  ],
};

module.exports = config;
