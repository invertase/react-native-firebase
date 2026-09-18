@_exported import FirebaseAnalytics
@_exported import FirebaseCore
@_exported import FirebaseInstallations
@_exported import FirebaseMessaging

// The dynamic product owns the Firebase SDK link graph. Objective-C RNFB
// sources continue importing Firebase's modules directly; Swift consumers
// import this module to cross SwiftPM's direct-dependency boundary.
public enum RNFBFirebaseUmbrella {}
