const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const config = {
  plugins: [
    //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    tailwindcss(),
    //But others, like autoprefixer, need to run after,
    autoprefixer,
    // cssnano({
    //   preset:
    //     process.env.NODE_ENV === 'production' ? require('cssnano-preset-default') : require('cssnano-preset-lite'),
    // }),
  ],
};

module.exports = config;
