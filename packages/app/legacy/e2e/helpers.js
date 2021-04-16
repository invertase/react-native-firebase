exports.getE2eTestProject = function getE2eTestProject() {
  return 'react-native-firebase-testing';
};

exports.getE2eEmulatorHost = function getE2eEmulatorHost() {
  // Note that in most package implementations involving the emulator, we re-write
  // localhost and 127.0.0.1 on Android to 10.0.2.2 (the Android emulator host interface)
  // But this specific code is executing in the host context even during E2E test.
  // So no re-write is necessary here.
  return 'localhost';
};
