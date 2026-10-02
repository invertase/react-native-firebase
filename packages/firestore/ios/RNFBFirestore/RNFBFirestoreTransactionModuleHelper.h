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
// Firebase Firestore for RNFBFirestoreTransactionModule. This keeps the
// TurboModule .mm free of Firebase imports.
@interface RNFBFirestoreTransactionModuleHelper : NSObject

+ (void)invalidate;

+ (void)transactionBegin:(NSString *)appName
              databaseId:(NSString *)databaseId
           transactionId:(double)transactionId
             maxAttempts:(double)maxAttempts;

+ (void)transactionGetDocument:(NSString *)appName
                    databaseId:(NSString *)databaseId
                 transactionId:(double)transactionId
                          path:(NSString *)path
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject;

+ (void)transactionDispose:(NSString *)appName
                databaseId:(NSString *)databaseId
             transactionId:(double)transactionId;

+ (void)transactionApplyBuffer:(NSString *)appName
                    databaseId:(NSString *)databaseId
                 transactionId:(double)transactionId
                 commandBuffer:(NSArray *)commandBuffer;

@end
