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

/// Path lookup previously hard-wired to `NSSearchPathForDirectoriesInDomains`.
public typealias RNFBUtilsPathProvider = (Int32) -> String?

/**
 * Foundation-pure helpers previously inline in `RNFBUtilsModule.mm`.
 *
 * Mirrors pre-port:
 * - `pathForDirectory` → `NSSearchPathForDirectoriesInDomains(..., NSUserDomainMask, YES).firstObject`
 * - constants keys + optional `appVersion` when `CFBundleShortVersionString` is a non-empty `NSString`
 * - remote asset prefixes `assets-library://` / `ph://`
 * - HEIC via `pathExtension` + `caseInsensitiveCompare:` (nil path → YES, matching ObjC nil messaging)
 * - query item lookup via `NSPredicate` `name=%@` + `firstObject`
 */
@objc(RNFBUtilsHelpers)
public final class RNFBUtilsHelpers: NSObject {
  @objc(pathForDirectory:)
  public static func path(forDirectory directory: Int32) -> String? {
    let searchDirectory = FileManager.SearchPathDirectory(rawValue: UInt(directory))!
    let paths = NSSearchPathForDirectoriesInDomains(searchDirectory, .userDomainMask, true)
    return paths.first
  }

  @objc(utilsConstantsDictionary)
  public static func utilsConstantsDictionary() -> NSDictionary {
    utilsConstantsDictionary(
      bundlePath: Bundle.main.bundlePath,
      appVersion: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString"),
      pathProvider: { directory in path(forDirectory: directory) },
      temporaryDirectory: NSTemporaryDirectory()
    )
  }

  @objc(utilsConstantsDictionaryWithBundlePath:appVersion:pathProvider:temporaryDirectory:)
  public static func utilsConstantsDictionary(
    bundlePath: String,
    appVersion: Any?,
    pathProvider: @escaping RNFBUtilsPathProvider,
    temporaryDirectory: String
  ) -> NSDictionary {
    let constants = NSMutableDictionary()
    constants["isRunningInTestLab"] = NSNumber(value: false)
    constants["MAIN_BUNDLE"] = bundlePath
    constants["CACHES_DIRECTORY"] = pathProvider(
      Int32(FileManager.SearchPathDirectory.cachesDirectory.rawValue)
    )
    constants["DOCUMENT_DIRECTORY"] = pathProvider(
      Int32(FileManager.SearchPathDirectory.documentDirectory.rawValue)
    )
    constants["PICTURES_DIRECTORY"] = pathProvider(
      Int32(FileManager.SearchPathDirectory.picturesDirectory.rawValue)
    )
    constants["MOVIES_DIRECTORY"] = pathProvider(
      Int32(FileManager.SearchPathDirectory.moviesDirectory.rawValue)
    )
    constants["TEMP_DIRECTORY"] = temporaryDirectory
    constants["LIBRARY_DIRECTORY"] = pathProvider(
      Int32(FileManager.SearchPathDirectory.libraryDirectory.rawValue)
    )

    // Pre-port: `[appVersion isKindOfClass:[NSString class]] && appVersion.length > 0`
    if let appVersion = appVersion as? String, !appVersion.isEmpty {
      constants["appVersion"] = appVersion
    }

    return constants.copy() as! NSDictionary
  }

  @objc(isRemoteAsset:)
  public static func isRemoteAsset(_ localFilePath: String?) -> Bool {
    // Pre-port: nil receiver → hasPrefix returns NO
    guard let localFilePath else {
      return false
    }
    return localFilePath.hasPrefix("assets-library://") || localFilePath.hasPrefix("ph://")
  }

  @objc(unused_isHeic:)
  public static func unusedIsHeic(_ localFilePath: String?) -> Bool {
    // Pre-port: `[[localFilePath pathExtension] caseInsensitiveCompare:@"heic"] == NSOrderedSame`
    // Messaging nil returns 0 for NSComparisonResult → equals NSOrderedSame → YES.
    let pathExtension = (localFilePath as NSString?)?.pathExtension
    guard let pathExtension else {
      return true
    }
    return (pathExtension as NSString).caseInsensitiveCompare("heic") == .orderedSame
  }

  @objc(valueForKey:fromQueryItems:)
  public static func value(forKey key: String?, fromQueryItems queryItems: [Any]?) -> String? {
    // Pre-port: nil queryItems → filteredArray nil → firstObject nil → value nil
    guard let queryItems else {
      return nil
    }
    let predicate = NSPredicate(format: "name=%@", key ?? "")
    let queryItem = (queryItems as NSArray).filtered(using: predicate).first as? URLQueryItem
    return queryItem?.value
  }
}
