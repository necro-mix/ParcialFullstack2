module.exports = function configureKarma(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      {
        pattern: 'src/**/*.karma.spec.js',
        watched: false,
      },
    ],
    preprocessors: {
      'src/**/*.karma.spec.js': ['esbuild'],
    },
    esbuild: {
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      target: 'es2020',
      singleBundle: true,
    },
    browsers: ['jsdom'],
    reporters: ['progress'],
    plugins: [
      require('karma-jasmine'),
      require('karma-jsdom-launcher'),
      require('karma-esbuild'),
    ],
    singleRun: true,
    autoWatch: false,
  });
};
