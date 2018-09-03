module.exports = {
  env: {
    development: {
      presets: ['module:metro-react-native-babel-preset'],
      plugins: ['transform-flow-strip-types'],
    },
    publish: {
      presets: ['@invertase/react-native-syntax'],
      plugins: ['transform-flow-strip-types'],
    },
  },
};
