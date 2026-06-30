module.exports = {
  dependency: {
    platforms: {
      android: {
        packageImportPath: 'import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;',
        cmakeListsPath:
          './src/reactnative/java/io/invertase/firebase/app/generated/jni/CMakeLists.txt',
      },
      ios: {
        scriptPhases: [
          {
            name: '[RNFB] Core Configuration',
            path: './ios_config.sh',
            execution_position: 'after_compile',
            input_files: ['$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)'],
          },
        ],
      },
    },
  },
};
