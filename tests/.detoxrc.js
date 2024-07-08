/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/testing.app',
      build: 'set -o pipefail && xcodebuild VALID_ARCHS="`uname -m`"  CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++ -workspace ios/testing.xcworkspace -scheme testing -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build | xcbeautify'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/testing.app',
      build: 'export RCT_NO_LAUNCH_PACKAGER=true && set -o pipefail | xcodebuild  CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++ -workspace ios/testing.xcworkspace -scheme testing -configuration Release -sdk iphonesimulator -derivedDataPath ios/build | xcbeautify'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest lintDebug -DtestBuildType=debug && cd ..',
      reversePorts: [
        8080,
        8081,
        8090,
        9000,
        9099,
        9199
      ]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'TestingAVD'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug'
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    }
  }
};
