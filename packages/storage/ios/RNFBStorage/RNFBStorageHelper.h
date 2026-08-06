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
// `FIRStorage`/`FIRStorageReference` for RNFBStorageModule. This keeps
// RNFBStorageModule.mm free of Firebase Storage imports, which is required
// because `FirebaseStorage` is a Swift-only SPM product and `@import` for
// Swift-only products is unusable from Objective-C++ (.mm) files when C++
// modules are disabled (required by React Native's JSI headers).
@interface RNFBStorageHelper : NSObject

+ (void)invalidate;

+ (void)deleteObject:(NSString *)appName
                 url:(NSString *)url
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject;

+ (void)getDownloadURL:(NSString *)appName
                   url:(NSString *)url
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

+ (void)getMetadata:(NSString *)appName
                url:(NSString *)url
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject;

+ (void)updateMetadata:(NSString *)appName
                   url:(NSString *)url
              metadata:(NSDictionary *_Nullable)metadata
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

+ (void)list:(NSString *)appName
           url:(NSString *)url
    maxResults:(long)maxResults
     pageToken:(NSString *_Nullable)pageToken
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject;

+ (void)listAll:(NSString *)appName
            url:(NSString *)url
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject;

+ (void)setMaxDownloadRetryTime:(NSString *)appName
                   milliseconds:(double)milliseconds
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject;

+ (void)setMaxOperationRetryTime:(NSString *)appName
                    milliseconds:(double)milliseconds
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject;

+ (void)setMaxUploadRetryTime:(NSString *)appName
                 milliseconds:(double)milliseconds
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject;

+ (void)writeToFile:(NSString *)appName
                url:(NSString *)url
      localFilePath:(NSString *)localFilePath
             taskId:(double)taskId
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject;

+ (void)putFile:(NSString *)appName
              url:(NSString *)url
    localFilePath:(NSString *)localFilePath
         metadata:(NSDictionary *_Nullable)metadata
           taskId:(double)taskId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;

+ (void)putString:(NSString *)appName
              url:(NSString *)url
           string:(NSString *)string
           format:(NSString *)format
         metadata:(NSDictionary *_Nullable)metadata
           taskId:(double)taskId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;

+ (void)useEmulator:(NSString *)appName
               host:(NSString *)host
               port:(double)port
          bucketUrl:(NSString *)bucketUrl;

+ (NSNumber *)setTaskStatus:(NSString *)appName taskId:(double)taskId status:(double)status;

+ (NSDictionary *)storageConstantsDictionary;

@end
