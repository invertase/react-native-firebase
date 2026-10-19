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
#import <React/RCTBridgeModule.h>

// Plain Objective-C helper (see docs/ios-spm.mdx and
// okf-bundle/ios-spm-native-imports.md) that owns every call touching
// Firebase Core / Functions and the Swift CallHandler / StreamHandler for
// RNFBFunctionsModule. This keeps RNFBFunctionsModule.mm free of Firebase
// imports and `*-Swift.h`: under SPM FirebaseFunctions is a pure-Swift
// module, and an Objective-C++ (.mm) TurboModule cannot `@import` Firebase
// (or parse a Swift-generated header that uses module imports) when C++
// modules are disabled (required by React Native's JSI headers).
@interface RNFBFunctionsHelper : NSObject

+ (void)httpsCallableWithAppName:(NSString *)appName
               customUrlOrRegion:(NSString *)customUrlOrRegion
                    emulatorHost:(NSString *_Nullable)emulatorHost
                    emulatorPort:(int)emulatorPort
                            name:(NSString *)name
                            data:(id _Nullable)data
                         timeout:(double)timeout
         limitedUseAppCheckToken:(BOOL)limitedUseAppCheckToken
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject;

+ (void)httpsCallableFromUrlWithAppName:(NSString *)appName
                      customUrlOrRegion:(NSString *)customUrlOrRegion
                           emulatorHost:(NSString *_Nullable)emulatorHost
                           emulatorPort:(int)emulatorPort
                                    url:(NSString *)url
                                   data:(id _Nullable)data
                                timeout:(double)timeout
                limitedUseAppCheckToken:(BOOL)limitedUseAppCheckToken
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject;

/** Allocates a stream handler (responds to `cancel`) for registry identity. */
+ (id)createStreamHandler;

/**
 * Starts streaming on an existing handler from `+createStreamHandler`.
 * Pass either `functionName` or `functionUrl`.
 */
+ (void)startStreamOnHandler:(id)handler
                     appName:(NSString *)appName
           customUrlOrRegion:(NSString *)customUrlOrRegion
                emulatorHost:(NSString *_Nullable)emulatorHost
                emulatorPort:(int)emulatorPort
                functionName:(NSString *_Nullable)functionName
                 functionUrl:(NSString *_Nullable)functionUrl
                  parameters:(id _Nullable)parameters
                     timeout:(double)timeout
               eventCallback:(void (^)(NSDictionary *event))eventCallback;

@end
