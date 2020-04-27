module.exports = {
  env: {
    development: {
      presets: [
        [
          '@invertase/react-native-syntax',
          {
            flow: 'comment',
          },
        ],
      ],
    },
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
        '@babel/preset-flow',
      ],
    },
    publish: {
      presets: [
        [
          '@invertase/react-native-syntax',
          {
            flow: 'strip',
          },
        ],
      ],
    },
  },
};
