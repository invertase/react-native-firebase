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

#if RNFB_DYNAMIC_FIREBASE_PROBE
import RNFBFirebase
#else
import FirebaseCore
#endif
import Foundation

/**
 * FIRApp configure / lookup / allApps previously hard-wired in `RNFBAppModule.mm`.
 *
 * Production adapts live `FirebaseApp` class methods; unit tests inject a lifecycle double.
 */
@objc public protocol RNFBFIRAppLifecycle: AnyObject {
  @objc(defaultApp)
  func defaultApp() -> AnyObject?

  @objc(appNamed:)
  func appNamed(_ name: String) -> AnyObject?

  @objc(allApps)
  func allApps() -> [AnyHashable: Any]?

  @objc(configureWithOptions:)
  func configure(withOptions options: AnyObject)

  @objc(configureWithName:options:)
  func configure(withName name: String, options: AnyObject)
}

/**
 * FIRApp instance mutations previously inline in `RNFBAppModule.mm`
 * (`dataCollectionDefaultEnabled`, `deleteApp:`).
 */
@objc public protocol RNFBFIRAppMutating: AnyObject {
  @objc(setDataCollectionDefaultEnabled:)
  func setDataCollectionDefaultEnabled(_ enabled: Bool)

  @objc(deleteApp:)
  func deleteApp(_ completion: @escaping (Bool) -> Void)
}

/**
 * FIRConfiguration logger previously hard-wired to
 * `[[FIRConfiguration sharedInstance] setLoggerLevel:]`.
 */
@objc public protocol RNFBFIRLoggerConfiguring: AnyObject {
  @objc(setLoggerLevel:)
  func setLoggerLevel(_ level: Int)
}

/**
 * Optional `+[FIRApp registerLibrary:withVersion:]` (FIRAppInternal) previously gated by
 * `#if __has_include(<FirebaseCore/FIRAppInternal.h>)`.
 */
@objc public protocol RNFBFIRLibraryRegistering: AnyObject {
  @objc(registerLibrary:withVersion:)
  func registerLibrary(_ name: String, withVersion version: String)
}

/**
 * Adapts live options creation for `RNFBFIROptionsCreating`.
 * Ownership lives in `RNFBFIROptionsAllocation` (always `takeRetainedValue()`).
 */
@objc(RNFBAppModuleFIROptionsFactory)
final class RNFBAppModuleFIROptionsFactory: NSObject, RNFBFIROptionsCreating {
  @objc static let shared = RNFBAppModuleFIROptionsFactory()

  func create(googleAppID: String?, gcmSenderID: String?) -> RNFBFIROptionsConfiguring {
    RNFBFIROptionsConfiguringAdapter(
      RNFBFIROptionsAllocation.create(googleAppID: googleAppID, gcmSenderID: gcmSenderID)
    )
  }
}

#if RNFB_DYNAMIC_FIREBASE_PROBE
/**
 * Adapts `RNFBFirebaseAppClient` class methods for `RNFBAppModuleFirebase`.
 */
@objc(RNFBFIRAppLifecycleAdapter)
final class RNFBFIRAppLifecycleAdapter: NSObject, RNFBFIRAppLifecycle {
  @objc static let shared = RNFBFIRAppLifecycleAdapter()

  func defaultApp() -> AnyObject? {
    RNFBFirebaseAppClient.defaultApp()
  }

  func appNamed(_ name: String) -> AnyObject? {
    RNFBFirebaseAppClient.app(named: name)
  }

  func allApps() -> [AnyHashable: Any]? {
    RNFBFirebaseAppClient.allApps()
  }

  func configure(withOptions options: AnyObject) {
    RNFBFirebaseAppClient.configure(options: options as! NSObject)
  }

  func configure(withName name: String, options: AnyObject) {
    RNFBFirebaseAppClient.configure(name: name, options: options as! NSObject)
  }
}

/**
 * Adapts logger level through the facade.
 */
@objc(RNFBFIRLoggerConfigurationAdapter)
final class RNFBFIRLoggerConfigurationAdapter: NSObject, RNFBFIRLoggerConfiguring {
  @objc static let shared = RNFBFIRLoggerConfigurationAdapter()

  func setLoggerLevel(_ level: Int) {
    RNFBFirebaseAppClient.setLoggerLevel(level)
  }
}

/**
 * Adapts optional library registration through the facade.
 */
@objc(RNFBFIRLibraryRegisteringAdapter)
final class RNFBFIRLibraryRegisteringAdapter: NSObject, RNFBFIRLibraryRegistering {
  @objc static let shared = RNFBFIRLibraryRegisteringAdapter()

  func registerLibrary(_ name: String, withVersion version: String) {
    RNFBFirebaseAppClient.registerLibrary(name: name, version: version)
  }
}
#else
/**
 * Adapts live `FirebaseApp` (`FIRApp`) class methods for `RNFBAppModuleFirebase`.
 */
@objc(RNFBFIRAppLifecycleAdapter)
final class RNFBFIRAppLifecycleAdapter: NSObject, RNFBFIRAppLifecycle {
  @objc static let shared = RNFBFIRAppLifecycleAdapter()

  func defaultApp() -> AnyObject? {
    FirebaseApp.app()
  }

  func appNamed(_ name: String) -> AnyObject? {
    FirebaseApp.app(name: name)
  }

  func allApps() -> [AnyHashable: Any]? {
    FirebaseApp.allApps
  }

  func configure(withOptions options: AnyObject) {
    FirebaseApp.configure(options: options as! FirebaseOptions)
  }

  func configure(withName name: String, options: AnyObject) {
    FirebaseApp.configure(name: name, options: options as! FirebaseOptions)
  }
}

/**
 * Adapts a live `FirebaseApp` instance for data-collection / delete.
 */
@objc(RNFBFIRAppMutatingAdapter)
final class RNFBFIRAppMutatingAdapter: NSObject, RNFBFIRAppMutating {
  private let app: FirebaseApp

  init(app: FirebaseApp) {
    self.app = app
  }

  func setDataCollectionDefaultEnabled(_ enabled: Bool) {
    app.isDataCollectionDefaultEnabled = enabled
  }

  func deleteApp(_ completion: @escaping (Bool) -> Void) {
    app.delete { success in
      completion(success)
    }
  }
}

/**
 * Adapts live `FirebaseConfiguration` (`FIRConfiguration`) for logger level.
 */
@objc(RNFBFIRLoggerConfigurationAdapter)
final class RNFBFIRLoggerConfigurationAdapter: NSObject, RNFBFIRLoggerConfiguring {
  @objc static let shared = RNFBFIRLoggerConfigurationAdapter()

  func setLoggerLevel(_ level: Int) {
    // Pre-port used an unchecked `(FIRLoggerLevel)level` cast. Unknown raw values
    // must pass through rather than falling back to `.error`.
    let loggerLevel = unsafeBitCast(level, to: FirebaseLoggerLevel.self)
    FirebaseConfiguration.shared.setLoggerLevel(loggerLevel)
  }
}

/**
 * Adapts optional `+[FIRApp registerLibrary:withVersion:]` when the selector exists
 * (same availability gate as pre-port `FIRAppInternal.h` / `REGISTER_LIB`).
 */
@objc(RNFBFIRLibraryRegisteringAdapter)
final class RNFBFIRLibraryRegisteringAdapter: NSObject, RNFBFIRLibraryRegistering {
  @objc static let shared = RNFBFIRLibraryRegisteringAdapter()

  private static let registerSelector = NSSelectorFromString("registerLibrary:withVersion:")

  static func registerLibrary(_ name: String, version: String, on target: NSObject.Type) {
    guard target.responds(to: registerSelector) else { return }
    target.perform(registerSelector, with: name, with: version)
  }

  func registerLibrary(_ name: String, withVersion version: String) {
    Self.registerLibrary(name, version: version, on: FirebaseApp.self)
  }
}
#endif

/**
 * FIRApp / FIROptions / FIRConfiguration helpers previously inline in `RNFBAppModule.mm`.
 *
 * Mirrors pre-port:
 * - default-app initialize reuses an already-configured default app
 * - named apps use `configureWithName:options:`
 * - `allApps` feeds `NATIVE_FIREBASE_APPS`
 * - `registerLibrary` runs once when the internal selector exists
 * - deleteApp completion + caller-owned retry
 */
@objc(RNFBAppModuleFirebase)
public final class RNFBAppModuleFirebase: NSObject {
  private static let registerLock = NSLock()
  private static var didRegisterLibrary = false

  @objc(optionsFactory)
  public static func optionsFactory() -> RNFBFIROptionsCreating {
    RNFBAppModuleFIROptionsFactory.shared
  }

  @objc(registerLibraryOnceWithName:version:)
  public static func registerLibraryOnce(name: String, version: String) {
    registerLibraryOnce(
      name: name,
      version: version,
      registrar: RNFBFIRLibraryRegisteringAdapter.shared
    )
  }

  @objc(registerLibraryOnceWithName:version:registrar:)
  public static func registerLibraryOnce(
    name: String,
    version: String,
    registrar: RNFBFIRLibraryRegistering
  ) {
    registerLock.lock()
    defer { registerLock.unlock() }
    guard !didRegisterLibrary else { return }
    didRegisterLibrary = true
    registrar.registerLibrary(name, withVersion: version)
  }

  /// Clears the once-token. Unit-test / HostStub seam only.
  @objc(resetRegisterLibraryOnceForTesting)
  public static func resetRegisterLibraryOnceForTesting() {
    registerLock.lock()
    defer { registerLock.unlock() }
    didRegisterLibrary = false
  }

  @objc(allApps)
  public static func allApps() -> [AnyObject] {
    allApps(lifecycle: RNFBFIRAppLifecycleAdapter.shared)
  }

  @objc(allAppsWithLifecycle:)
  public static func allApps(lifecycle: RNFBFIRAppLifecycle) -> [AnyObject] {
    guard let apps = lifecycle.allApps() else { return [] }
    return Array(apps.values).compactMap { $0 as AnyObject }
  }

  @objc(appForName:)
  public static func app(forName appName: String) -> AnyObject? {
    RCTConvertFIRApp.firApp(fromString: appName)
  }

  @objc(configureOrReuseAppWithOptions:nameResolution:)
  public static func configureOrReuseApp(
    options: RNFBFIROptionsConfiguring,
    nameResolution: RNFBAppInitializeNameResolution
  ) -> AnyObject? {
    configureOrReuseApp(
      options: options,
      nameResolution: nameResolution,
      lifecycle: RNFBFIRAppLifecycleAdapter.shared
    )
  }

  @objc(configureOrReuseAppWithOptions:nameResolution:lifecycle:)
  public static func configureOrReuseApp(
    options: RNFBFIROptionsConfiguring,
    nameResolution: RNFBAppInitializeNameResolution,
    lifecycle: RNFBFIRAppLifecycle
  ) -> AnyObject? {
    // Pre-port read the app back with `[FIRApp defaultApp]` / `appNamed:` and passed the
    // result on unchecked, so a nil lookup flowed to the caller rather than trapping.
    // Production factories wrap live `FirebaseOptions` in
    // `RNFBFIROptionsConfiguringAdapter`. Configure needs the underlying SDK object.
    let firOptions: AnyObject
    if let adapter = options as? RNFBFIROptionsConfiguringAdapter {
      firOptions = adapter.options
    } else {
      firOptions = options
    }
    if nameResolution.isDefaultApp {
      if let existing = lifecycle.defaultApp() {
        return existing
      }
      lifecycle.configure(withOptions: firOptions)
      return lifecycle.defaultApp()
    }
    let appName = nameResolution.appName ?? ""
    lifecycle.configure(withName: appName, options: firOptions)
    return lifecycle.appNamed(appName)
  }

  @objc(setLoggerLevel:)
  public static func setLoggerLevel(_ level: Int) {
    setLoggerLevel(level, configuration: RNFBFIRLoggerConfigurationAdapter.shared)
  }

  @objc(setLoggerLevel:configuration:)
  public static func setLoggerLevel(_ level: Int, configuration: RNFBFIRLoggerConfiguring) {
    configuration.setLoggerLevel(level)
  }

  @objc(setAutomaticDataCollectionEnabled:forAppName:)
  public static func setAutomaticDataCollectionEnabled(_ enabled: Bool, forAppName appName: String) {
    guard let app = app(forName: appName) else { return }
#if RNFB_DYNAMIC_FIREBASE_PROBE
    _ = RNFBFirebaseAppClient.setDataCollectionDefaultEnabled(enabled, forApp: app as! NSObject)
#else
    guard let firebaseApp = app as? FirebaseApp else { return }
    RNFBFIRAppMutatingAdapter(app: firebaseApp).setDataCollectionDefaultEnabled(enabled)
#endif
  }

  @objc(setDataCollectionDefaultEnabled:forApp:)
  public static func setDataCollectionDefaultEnabled(_ enabled: Bool, forApp app: AnyObject) {
#if RNFB_DYNAMIC_FIREBASE_PROBE
    _ = RNFBFirebaseAppClient.setDataCollectionDefaultEnabled(enabled, forApp: app as! NSObject)
#else
    guard let firebaseApp = app as? FirebaseApp else { return }
    RNFBFIRAppMutatingAdapter(app: firebaseApp).setDataCollectionDefaultEnabled(enabled)
#endif
  }

  @objc(deleteApp:completion:)
  public static func deleteApp(_ app: AnyObject, completion: @escaping (Bool) -> Void) {
#if RNFB_DYNAMIC_FIREBASE_PROBE
    if !RNFBFirebaseAppClient.deleteApp(app as! NSObject, completion: completion) {
      completion(false)
    }
#else
    guard let firebaseApp = app as? FirebaseApp else {
      completion(false)
      return
    }
    RNFBFIRAppMutatingAdapter(app: firebaseApp).deleteApp(completion)
#endif
  }

  @objc(deleteApp:mutating:completion:)
  public static func deleteApp(
    _ app: AnyObject,
    mutating: RNFBFIRAppMutating,
    completion: @escaping (Bool) -> Void
  ) {
    _ = app
    mutating.deleteApp(completion)
  }

  /// Native `deleteApp` with missing-app resolve-null and retry-once reject.
  @objc(deleteAppNamed:resolve:reject:)
  public static func deleteApp(
    named appName: String,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    deleteApp(
      named: appName,
      resolve: resolve,
      reject: reject,
      appLookup: { app(forName: $0) },
      performDelete: { candidate, completion in
        deleteApp(candidate, completion: completion)
      }
    )
  }

  /// Testable delete orchestration (lookup + retry-once).
  public static func deleteApp(
    named appName: String,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void,
    appLookup: (String) -> AnyObject?,
    performDelete: @escaping (AnyObject, @escaping (Bool) -> Void) -> Void
  ) {
    guard let firApp = appLookup(appName) else {
      resolve(NSNull())
      return
    }

    performDelete(firApp) { success in
      if success {
        RNFBAppCustomAuthDomains.setCustomDomain(nil, forAppName: appName)
        resolve(NSNull())
      } else {
        performDelete(firApp) { success2 in
          if success2 {
            RNFBAppCustomAuthDomains.setCustomDomain(nil, forAppName: appName)
            resolve(NSNull())
          } else {
            reject("app/delete-app-failed", "Failed to delete the specified app.", nil)
          }
        }
      }
    }
  }
}
