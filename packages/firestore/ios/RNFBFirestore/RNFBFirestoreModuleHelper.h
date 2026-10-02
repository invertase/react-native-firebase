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
// Firebase Firestore / FIRPersistentCacheIndexManager for
// RNFBFirestoreModule. This keeps RNFBFirestoreModule.mm free of Firebase
// imports and internal Firestore headers: under SPM an Objective-C++
// (.mm) TurboModule cannot `@import` Firebase (or parse headers that
// pull Firebase into the TU) when C++ modules are disabled (required by
// React Native's JSI headers).
@interface RNFBFirestoreModuleHelper : NSObject

+ (void)invalidate;

+ (void)setLogLevel:(NSString *)logLevel;

+ (void)disableNetwork:(NSString *)appName
            databaseId:(NSString *)databaseId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

+ (void)enableNetwork:(NSString *)appName
           databaseId:(NSString *)databaseId
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

+ (void)settings:(NSString *)appName
      databaseId:(NSString *)databaseId
        settings:(NSDictionary *)settings
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject;

+ (void)loadBundle:(NSString *)appName
        databaseId:(NSString *)databaseId
            bundle:(NSString *)bundle
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;

+ (void)clearPersistence:(NSString *)appName
              databaseId:(NSString *)databaseId
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

+ (void)useEmulator:(NSString *)appName
         databaseId:(NSString *)databaseId
               host:(NSString *)host
               port:(double)port;

+ (void)waitForPendingWrites:(NSString *)appName
                  databaseId:(NSString *)databaseId
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject;

+ (void)terminate:(NSString *)appName
       databaseId:(NSString *)databaseId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;

+ (void)persistenceCacheIndexManager:(NSString *)appName
                          databaseId:(NSString *)databaseId
                         requestType:(double)requestType
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject;

+ (void)addSnapshotsInSync:(NSString *)appName
                databaseId:(NSString *)databaseId
                listenerId:(double)listenerId;

+ (void)removeSnapshotsInSync:(NSString *)appName
                   databaseId:(NSString *)databaseId
                   listenerId:(double)listenerId;

@end
