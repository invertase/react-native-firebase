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
// Firebase Firestore / RNFBFirestore-Swift (pipeline) for
// RNFBFirestoreCollectionModule. This keeps the TurboModule .mm free of
// Firebase imports and `*-Swift.h`.
@interface RNFBFirestoreCollectionModuleHelper : NSObject

+ (void)invalidate;

+ (void)namedQueryOnSnapshot:(NSString *)appName
                  databaseId:(NSString *)databaseId
                   queryName:(NSString *)queryName
                        type:(NSString *)type
                     filters:(NSArray *)filters
                      orders:(NSArray *)orders
                     options:(NSDictionary *)options
                  listenerId:(double)listenerId
       snapshotListenOptions:(NSDictionary *)snapshotListenOptions;

+ (void)collectionOnSnapshot:(NSString *)appName
                  databaseId:(NSString *)databaseId
                        path:(NSString *)path
                        type:(NSString *)type
                     filters:(NSArray *)filters
                      orders:(NSArray *)orders
                     options:(NSDictionary *)options
                  listenerId:(double)listenerId
       snapshotListenOptions:(NSDictionary *)snapshotListenOptions;

+ (void)collectionOffSnapshot:(NSString *)appName
                   databaseId:(NSString *)databaseId
                   listenerId:(double)listenerId;

+ (void)namedQueryGet:(NSString *)appName
           databaseId:(NSString *)databaseId
            queryName:(NSString *)queryName
                 type:(NSString *)type
              filters:(NSArray *)filters
               orders:(NSArray *)orders
              options:(NSDictionary *)options
           getOptions:(NSDictionary *)getOptions
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

+ (void)collectionCount:(NSString *)appName
             databaseId:(NSString *)databaseId
                   path:(NSString *)path
                   type:(NSString *)type
                filters:(NSArray *)filters
                 orders:(NSArray *)orders
                options:(NSDictionary *)options
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject;

+ (void)aggregateQuery:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
                  type:(NSString *)type
               filters:(NSArray *)filters
                orders:(NSArray *)orders
               options:(NSDictionary *)options
      aggregateQueries:(NSArray *)aggregateQueries
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

+ (void)pipelineExecute:(NSString *)appName
             databaseId:(NSString *)databaseId
               pipeline:(NSDictionary *)pipeline
                options:(NSDictionary *)options
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject;

+ (void)collectionGet:(NSString *)appName
           databaseId:(NSString *)databaseId
                 path:(NSString *)path
                 type:(NSString *)type
              filters:(NSArray *)filters
               orders:(NSArray *)orders
              options:(NSDictionary *)options
           getOptions:(NSDictionary *)getOptions
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

@end
