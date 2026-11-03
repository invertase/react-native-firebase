module.exports = {
  dependency: {
    platforms: {
      android: {
        cmakeListsPath:
          './src/reactnative/java/io/invertase/firebase/config/generated/jni/CMakeLists.txt',
      },
    },
  },
  spm: {
    autolinkingPlugin: './spm-autolinking-plugin.js',
  },
};
