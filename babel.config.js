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
          root: ['./'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.png'], // Add .png to handle image assets
          alias: {
            components: './components',
            services: './services',
            styles: './styles',
            utils: './utils',
            assets: './assets',
            api: './api'
          },
        },
      ],
    ],
  };
};