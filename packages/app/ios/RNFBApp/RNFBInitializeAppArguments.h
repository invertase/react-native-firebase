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
 *
 */

#import <Foundation/Foundation.h>

/**
 * Foundation-only normalisation of the `options` and `appConfig` dictionaries passed to
 * `initializeApp`. On the New Architecture they arrive as plain `NSDictionary` values, so a JS
 * `null` property is still a `{__rnfbNull: true}` sentinel. These helpers decode the sentinels and
 * drop optional keys whose value is `NSNull`, so the optional key is treated as absent (except
 * `automaticDataCollectionEnabled`, where null means false). Kept free
 * of Firebase and React imports so unit-test targets can compile it directly.
 */
@interface RNFBInitializeAppArguments : NSObject

/**
 * Returns `options` with null sentinels decoded. Optional string keys (`databaseURL`,
 * `storageBucket`, `iosBundleId`, `iosClientId`, `appGroupId`, `authDomain`) that are null are
 * removed. Other keys are left as received. Returns nil for a nil `options` or a root-level null
 * sentinel.
 */
+ (NSDictionary *)normalizedOptions:(NSDictionary *)options;

/**
 * Returns `appConfig` with null sentinels decoded. A null `name` is removed so it
 * reads as absent. A null `automaticDataCollectionEnabled` becomes `@NO`, matching the JS
 * `!!null` in `FirebaseApp`. An omitted `automaticDataCollectionEnabled` stays omitted. Other keys
 * are left as received. Returns nil for a nil `appConfig` or a root-level null sentinel.
 */
+ (NSDictionary *)normalizedAppConfig:(NSDictionary *)appConfig;

/**
 * Reads `automaticDataCollectionEnabled` from `appConfig`. Returns `@([value boolValue])` for an
 * `NSNumber`, and nil when the key is absent or not an `NSNumber` (including `NSNull`), meaning the
 * SDK / Info.plist default must be left untouched. Pass the result of `normalizedAppConfig:` so a
 * null sentinel has already become `@NO`.
 */
+ (NSNumber *)automaticDataCollectionEnabledFromAppConfig:(NSDictionary *)appConfig;

@end
