const cssnano = require('cssnano');
const tailwind = require('@tailwindcss/postcss');

const config = {
  plugins: [
    tailwind(),
    cssnano({
      preset:
        process.env.NODE_ENV === 'production' ? require('cssnano-preset-default') : require('cssnano-preset-lite'),
    }),
  ],
};

module.exports = config;
