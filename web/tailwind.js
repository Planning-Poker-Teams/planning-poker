module.exports = {
  purge: { content: ['./public/index.html', './src/**/*.html', './src/**/*.vue'] },
  theme: {
    extend: {
      width: {
        '72': '18rem',
        '96': '24rem',
      },
    },
  },
  variants: {},
  plugins: [],
};
