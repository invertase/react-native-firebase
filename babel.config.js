module.exports = {
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
        'module:./tests/node_modules/metro-react-native-babel-preset',
      ],
    },
  },
};
