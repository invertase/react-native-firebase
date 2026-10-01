// swift-tools-version: 5.9
//
// CI probe only (RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE=1). Shipped podspecs keep
// spm_dependency on firebase-ios-sdk. Exact pin tracks packages/app/package.json
// sdkVersions.ios.firebase.
//
// This package resolver rejects mixed Swift and Objective-C sources in one
// target. SDK calls live in RNFBFirebaseBridge. The dynamic product links that
// target beside the Swift target. The Swift target does not depend on it, so
// the emitted module does not record FirebaseCore for clients.

import PackageDescription

let package = Package(
  name: "RNFBFirebase",
  platforms: [
    .iOS(.v15),
    .macOS(.v10_15),
    .tvOS(.v15),
  ],
  products: [
    .library(
      name: "RNFBFirebase",
      type: .dynamic,
      targets: ["RNFBFirebase", "RNFBFirebaseBridge"]
    ),
  ],
  dependencies: [
    .package(
      url: "https://github.com/firebase/firebase-ios-sdk.git",
      exact: "12.19.0"
    ),
  ],
  targets: [
    .target(
      name: "RNFBFirebaseBridge",
      dependencies: [
        .product(name: "FirebaseCore", package: "firebase-ios-sdk"),
        .product(name: "FirebaseInstallations", package: "firebase-ios-sdk"),
      ],
      // Public headers stay empty so this clang target does not publish a
      // module. The dynamic product still links the object file. The Swift
      // target does not depend on it, so clients do not inherit FirebaseCore.
      publicHeadersPath: "Public",
      cSettings: [
        .headerSearchPath("include"),
      ]
    ),
    .target(
      name: "RNFBFirebase"
    ),
  ]
)
