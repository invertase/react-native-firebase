module.exports = {
  dependency: {
    platforms: {
      android: {
        cmakeListsPath:
          './src/main/java/io/invertase/firebase/crashlytics/generated/jni/CMakeLists.txt',
      },
      ios: {
        scriptPhases: [
          {
            name: '[RNFB] Crashlytics Configuration',
            path: './ios_config.sh',
            execution_position: 'after_compile',
            input_files: [
              '${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Resources/DWARF/${TARGET_NAME}',
              '$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)',
            ],
          },
        ],
      },
    },
  },
};
