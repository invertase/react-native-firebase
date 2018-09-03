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
