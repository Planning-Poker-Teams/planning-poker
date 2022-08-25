module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'Planning Poker';
      return args;
    });
  },
  settings: {
    'vetur.useWorkspaceDependencies': true,
    'vetur.experimental.templateInterpolationService': true
  },
  projects: [{
    root: './web',
    package: './package.json',
    tsconfig: './tsconfig.json',
    globalComponents: [
      './src/**/*.vue'
    ]
  }]
};
