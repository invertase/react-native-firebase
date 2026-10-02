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
// Firebase Firestore for RNFBFirestoreDocumentModule. This keeps the
// TurboModule .mm free of Firebase imports.
@interface RNFBFirestoreDocumentModuleHelper : NSObject

+ (void)invalidate;

+ (void)documentOnSnapshot:(NSString *)appName
                databaseId:(NSString *)databaseId
                      path:(NSString *)path
                listenerId:(double)listenerId
     snapshotListenOptions:(NSDictionary *)snapshotListenOptions;

+ (void)documentOffSnapshot:(NSString *)appName
                 databaseId:(NSString *)databaseId
                 listenerId:(double)listenerId;

+ (void)documentGet:(NSString *)appName
         databaseId:(NSString *)databaseId
               path:(NSString *)path
         getOptions:(NSDictionary *)getOptions
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject;

+ (void)documentDelete:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

+ (void)documentSet:(NSString *)appName
         databaseId:(NSString *)databaseId
               path:(NSString *)path
               data:(NSDictionary *)data
            options:(NSDictionary *)options
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject;

+ (void)documentUpdate:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
                  data:(NSDictionary *)data
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

+ (void)documentBatch:(NSString *)appName
           databaseId:(NSString *)databaseId
               writes:(NSArray *)writes
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

@end
