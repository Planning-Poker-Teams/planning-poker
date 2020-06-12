module.exports = {
  purge: {
    content: ['./public/index.html', './src/**/*.html', './src/**/*.vue'],
  },
  theme: {
    extend: {
      width: {
        '72': '18rem',
        '96': '24rem',
      },
      minHeight: {
        '16': '4rem',
        '24': '6rem',
      },
      opacity: {
        '90': '.9',
        '80': '.8',
        '70': '.7',
      },
    },
  },
  variants: {
    margin: ['first', 'last'],
  },
  plugins: [],
};
