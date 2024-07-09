exports.getE2eTestProject = function getE2eTestProject() {
  return 'react-native-firebase-testing';
};

exports.getE2eEmulatorHost = function getE2eEmulatorHost() {
  if (Platform.android) {
    return '10.0.2.2';
  }
  return '127.0.0.1';
};
