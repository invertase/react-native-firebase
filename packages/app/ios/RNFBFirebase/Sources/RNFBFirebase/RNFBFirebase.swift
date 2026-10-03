/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Foundation

/// Foundation-only snapshot of a live app for RNFBApp mapping code.
public final class RNFBFirebaseAppSnapshot: NSObject {
  public let name: String
  public let apiKey: String?
  public let googleAppID: String?
  public let projectID: String?
  public let databaseURL: String?
  public let storageBucket: String?
  public let gcmSenderID: String?
  public let clientID: String?
  public let isDataCollectionDefaultEnabled: Bool

  public init(
    name: String,
    apiKey: String?,
    googleAppID: String?,
    projectID: String?,
    databaseURL: String?,
    storageBucket: String?,
    gcmSenderID: String?,
    clientID: String?,
    isDataCollectionDefaultEnabled: Bool
  ) {
    self.name = name
    self.apiKey = apiKey
    self.googleAppID = googleAppID
    self.projectID = projectID
    self.databaseURL = databaseURL
    self.storageBucket = storageBucket
    self.gcmSenderID = gcmSenderID
    self.clientID = clientID
    self.isDataCollectionDefaultEnabled = isDataCollectionDefaultEnabled
  }
}

/// Live options operations. Public signatures stay Foundation types.
public enum RNFBFirebaseOptionsClient {
  public static func create(googleAppID: String?, gcmSenderID: String?) -> NSObject {
    rnfbWithCString(googleAppID) { appID in
      rnfbWithCString(gcmSenderID) { senderID in
        rnfbRetainedObject(RNFBFirebaseCreateOptions(appID, senderID))
      }
    }
  }

  public static func apiKey(_ options: NSObject) -> String? {
    rnfbString(RNFBFirebaseOptionsAPIKey(options))
  }

  public static func setAPIKey(_ value: String?, on options: NSObject) {
    rnfbWithCString(value) { RNFBFirebaseOptionsSetAPIKey(options, $0) }
  }

  public static func projectID(_ options: NSObject) -> String? {
    rnfbString(RNFBFirebaseOptionsProjectID(options))
  }

  public static func setProjectID(_ value: String?, on options: NSObject) {
    rnfbWithCString(value) { RNFBFirebaseOptionsSetProjectID(options, $0) }
  }

  public static func clientID(_ options: NSObject) -> String? {
    rnfbString(RNFBFirebaseOptionsClientID(options))
  }

  public static func setClientID(_ value: String?, on options: NSObject) {
    rnfbWithCString(value) { RNFBFirebaseOptionsSetClientID(options, $0) }
  }

  public static func databaseURL(_ options: NSObject) -> String? {
    rnfbString(RNFBFirebaseOptionsDatabaseURL(options))
  }

  public static func setDatabaseURL(_ value: String?, on options: NSObject) {
    rnfbWithCString(value) { RNFBFirebaseOptionsSetDatabaseURL(options, $0) }
  }

  public static func storageBucket(_ options: NSObject) -> String? {
    rnfbString(RNFBFirebaseOptionsStorageBucket(options))
  }

  public static func setStorageBucket(_ value: String?, on options: NSObject) {
    rnfbWithCString(value) { RNFBFirebaseOptionsSetStorageBucket(options, $0) }
  }

  public static func bundleID(_ options: NSObject) -> String? {
    rnfbString(RNFBFirebaseOptionsBundleID(options))
  }

  public static func setBundleID(_ value: String?, on options: NSObject) {
    rnfbWithCString(value) { RNFBFirebaseOptionsSetBundleID(options, $0) }
  }

  public static func appGroupID(_ options: NSObject) -> String? {
    rnfbString(RNFBFirebaseOptionsAppGroupID(options))
  }

  public static func setAppGroupID(_ value: String?, on options: NSObject) {
    rnfbWithCString(value) { RNFBFirebaseOptionsSetAppGroupID(options, $0) }
  }
}

/// Live app operations. No SDK types cross this boundary.
public enum RNFBFirebaseAppClient {
  public static func defaultApp() -> NSObject? {
    rnfbObject(RNFBFirebaseDefaultApp())
  }

  public static func app(named name: String) -> NSObject? {
    name.withCString { rnfbObject(RNFBFirebaseAppNamed($0)) }
  }

  public static func allApps() -> [AnyHashable: Any]? {
    guard let apps = rnfbDictionary(RNFBFirebaseAllApps()) else { return nil }
    var result: [AnyHashable: Any] = [:]
    for (key, value) in apps {
      guard let key = key as? AnyHashable else { continue }
      result[key] = value
    }
    return result
  }

  /// Default-plist configure. The dynamic probe app cannot name the SDK app type.
  public static func configure() {
    RNFBFirebaseConfigure()
  }

  public static func configure(options: NSObject) {
    RNFBFirebaseConfigureWithOptions(options)
  }

  public static func configure(name: String, options: NSObject) {
    name.withCString { RNFBFirebaseConfigureWithName($0, options) }
  }

  public static func snapshot(of app: NSObject) -> RNFBFirebaseAppSnapshot {
    let raw = rnfbDictionary(RNFBFirebaseSnapshot(app)) ?? [:]
    return RNFBFirebaseAppSnapshot(
      name: raw["name"] as? String ?? "",
      apiKey: snapshotString(raw, "apiKey"),
      googleAppID: snapshotString(raw, "googleAppID"),
      projectID: snapshotString(raw, "projectID"),
      databaseURL: snapshotString(raw, "databaseURL"),
      storageBucket: snapshotString(raw, "storageBucket"),
      gcmSenderID: snapshotString(raw, "gcmSenderID"),
      clientID: snapshotString(raw, "clientID"),
      isDataCollectionDefaultEnabled: raw["isDataCollectionDefaultEnabled"] as? Bool ?? false
    )
  }

  /// Returns false when `app` is not a live app (caller no-ops).
  public static func setDataCollectionDefaultEnabled(_ enabled: Bool, forApp app: NSObject) -> Bool {
    RNFBFirebaseSetDataCollectionDefaultEnabled(ObjCBool(enabled), app).boolValue
  }

  /// Returns false when `app` is not a live app. Does not invoke `completion` in that case.
  public static func deleteApp(_ app: NSObject, completion: @escaping (Bool) -> Void) -> Bool {
    RNFBFirebaseDeleteApp(app) { success in
      completion(success.boolValue)
    }.boolValue
  }

  public static func setLoggerLevel(_ level: Int) {
    RNFBFirebaseSetLoggerLevel(level)
  }

  public static func registerLibrary(name: String, version: String) {
    name.withCString { libraryName in
      version.withCString { libraryVersion in
        RNFBFirebaseRegisterLibrary(libraryName, libraryVersion)
      }
    }
  }

  private static func snapshotString(_ raw: NSDictionary, _ key: String) -> String? {
    guard let value = raw[key], !(value is NSNull) else { return nil }
    return value as? String
  }
}

// `@_silgen_name` sees the C ABI directly. Class optionals are not null
// pointers here, so object results cross as `OpaquePointer`. +0 results use
// `takeUnretainedValue`. The Create result is +1 and uses `takeRetainedValue`.

private func rnfbWithCString<T>(_ value: String?, _ body: (UnsafePointer<CChar>?) -> T) -> T {
  guard let value else { return body(nil) }
  return value.withCString(body)
}

private func rnfbRetainedObject(_ pointer: OpaquePointer) -> NSObject {
  Unmanaged<NSObject>.fromOpaque(UnsafeMutableRawPointer(pointer)).takeRetainedValue()
}

private func rnfbObject(_ pointer: OpaquePointer?) -> NSObject? {
  guard let pointer else { return nil }
  return Unmanaged<NSObject>.fromOpaque(UnsafeMutableRawPointer(pointer)).takeUnretainedValue()
}

private func rnfbString(_ pointer: OpaquePointer?) -> String? {
  guard let pointer else { return nil }
  let value = Unmanaged<NSString>.fromOpaque(UnsafeMutableRawPointer(pointer)).takeUnretainedValue()
  return value as String
}

private func rnfbDictionary(_ pointer: OpaquePointer?) -> NSDictionary? {
  guard let pointer else { return nil }
  return Unmanaged<NSDictionary>.fromOpaque(UnsafeMutableRawPointer(pointer)).takeUnretainedValue()
}

@_silgen_name("RNFBFirebaseCreateOptions")
private func RNFBFirebaseCreateOptions(
  _ googleAppID: UnsafePointer<CChar>?,
  _ senderID: UnsafePointer<CChar>?
) -> OpaquePointer
@_silgen_name("RNFBFirebaseOptionsAPIKey")
private func RNFBFirebaseOptionsAPIKey(_ options: NSObject) -> OpaquePointer?
@_silgen_name("RNFBFirebaseOptionsSetAPIKey")
private func RNFBFirebaseOptionsSetAPIKey(_ options: NSObject, _ value: UnsafePointer<CChar>?)
@_silgen_name("RNFBFirebaseOptionsProjectID")
private func RNFBFirebaseOptionsProjectID(_ options: NSObject) -> OpaquePointer?
@_silgen_name("RNFBFirebaseOptionsSetProjectID")
private func RNFBFirebaseOptionsSetProjectID(_ options: NSObject, _ value: UnsafePointer<CChar>?)
@_silgen_name("RNFBFirebaseOptionsClientID")
private func RNFBFirebaseOptionsClientID(_ options: NSObject) -> OpaquePointer?
@_silgen_name("RNFBFirebaseOptionsSetClientID")
private func RNFBFirebaseOptionsSetClientID(_ options: NSObject, _ value: UnsafePointer<CChar>?)
@_silgen_name("RNFBFirebaseOptionsDatabaseURL")
private func RNFBFirebaseOptionsDatabaseURL(_ options: NSObject) -> OpaquePointer?
@_silgen_name("RNFBFirebaseOptionsSetDatabaseURL")
private func RNFBFirebaseOptionsSetDatabaseURL(_ options: NSObject, _ value: UnsafePointer<CChar>?)
@_silgen_name("RNFBFirebaseOptionsStorageBucket")
private func RNFBFirebaseOptionsStorageBucket(_ options: NSObject) -> OpaquePointer?
@_silgen_name("RNFBFirebaseOptionsSetStorageBucket")
private func RNFBFirebaseOptionsSetStorageBucket(_ options: NSObject, _ value: UnsafePointer<CChar>?)
@_silgen_name("RNFBFirebaseOptionsBundleID")
private func RNFBFirebaseOptionsBundleID(_ options: NSObject) -> OpaquePointer?
@_silgen_name("RNFBFirebaseOptionsSetBundleID")
private func RNFBFirebaseOptionsSetBundleID(_ options: NSObject, _ value: UnsafePointer<CChar>?)
@_silgen_name("RNFBFirebaseOptionsAppGroupID")
private func RNFBFirebaseOptionsAppGroupID(_ options: NSObject) -> OpaquePointer?
@_silgen_name("RNFBFirebaseOptionsSetAppGroupID")
private func RNFBFirebaseOptionsSetAppGroupID(_ options: NSObject, _ value: UnsafePointer<CChar>?)
@_silgen_name("RNFBFirebaseDefaultApp")
private func RNFBFirebaseDefaultApp() -> OpaquePointer?
@_silgen_name("RNFBFirebaseAppNamed")
private func RNFBFirebaseAppNamed(_ name: UnsafePointer<CChar>) -> OpaquePointer?
@_silgen_name("RNFBFirebaseAllApps")
private func RNFBFirebaseAllApps() -> OpaquePointer?
@_silgen_name("RNFBFirebaseConfigure")
private func RNFBFirebaseConfigure()
@_silgen_name("RNFBFirebaseConfigureWithOptions")
private func RNFBFirebaseConfigureWithOptions(_ options: NSObject)
@_silgen_name("RNFBFirebaseConfigureWithName")
private func RNFBFirebaseConfigureWithName(_ name: UnsafePointer<CChar>, _ options: NSObject)
@_silgen_name("RNFBFirebaseSnapshot")
private func RNFBFirebaseSnapshot(_ app: NSObject) -> OpaquePointer
@_silgen_name("RNFBFirebaseSetDataCollectionDefaultEnabled")
private func RNFBFirebaseSetDataCollectionDefaultEnabled(_ enabled: ObjCBool, _ app: NSObject) -> ObjCBool
@_silgen_name("RNFBFirebaseDeleteApp")
private func RNFBFirebaseDeleteApp(
  _ app: NSObject,
  _ completion: @convention(block) (ObjCBool) -> Void
) -> ObjCBool
@_silgen_name("RNFBFirebaseSetLoggerLevel")
private func RNFBFirebaseSetLoggerLevel(_ level: Int)
@_silgen_name("RNFBFirebaseRegisterLibrary")
private func RNFBFirebaseRegisterLibrary(_ name: UnsafePointer<CChar>, _ version: UnsafePointer<CChar>)
