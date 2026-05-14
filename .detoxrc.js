module.exports = {
  testRunner: 'jest',
  apps: {
    'ios.simulator': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/FamilyTree.app',
      build: 'xcodebuild -workspace ios/FamilyTree.xcworkspace -scheme FamilyTree -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build ONLY_ACTIVE_ARCH=YES',
    },
    'android.emu': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone',
        name: 'iPhone 15 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_30',
      },
    },
  },
  configurations: {
    'ios.simulator': {
      device: 'simulator',
      app: 'ios.simulator',
    },
    'android.emu': {
      device: 'emulator',
      app: 'android.emu',
    },
  },
  artifacts: {
    rootDir: 'e2e/artifacts',
    pathBuilder: null,
    plugins: {
      log: { enabled: true, keepOnlyFailedTestsArtifacts: true },
      screenshot: { enabled: true, keepOnlyFailedTestsArtifacts: true },
      video: { enabled: false, keepOnlyFailedTestsArtifacts: false },
      instruments: { enabled: false },
    },
  },
  behavior: {
    init: {
      exposeGlobals: true,
      reinstallApp: true,
      keepAppState: false,
    },
    launchApp: 'auto',
  },
};
