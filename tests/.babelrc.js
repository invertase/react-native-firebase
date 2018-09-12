const { resolve } = require('path');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          // import library code from parent
          'react-native-firebase': resolve(__dirname, '../src'),
        },
        extensions: ['.js', '.ts', '.tsx', '.css'],
      },
    ],
    [
      'istanbul',
      {
        instrument: true,
        relativePath: false,
        include: ['**/src/**'],
        useInlineSourceMaps: true,
      },
    ],
  ],
};
