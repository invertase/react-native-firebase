// swift-tools-version: 5.9

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
      targets: ["RNFBFirebase"]
    ),
  ],
  dependencies: [
    .package(
      url: "https://github.com/firebase/firebase-ios-sdk.git",
      .upToNextMajor(from: "12.18.0")
    ),
  ],
  targets: [
    .target(
      name: "RNFBFirebase",
      dependencies: [
        .product(name: "FirebaseCore", package: "firebase-ios-sdk"),
        .product(name: "FirebaseInstallations", package: "firebase-ios-sdk"),
        .product(name: "FirebaseAnalytics", package: "firebase-ios-sdk"),
        .product(name: "FirebaseMessaging", package: "firebase-ios-sdk"),
      ]
    ),
  ]
)
