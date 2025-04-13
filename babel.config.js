module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./app/index.js'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.png'],
          alias: {
            components: './components',
            services: './services',
            styles: './styles',
            utils: './utils',
            assets: './assets',
            api: './api',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
