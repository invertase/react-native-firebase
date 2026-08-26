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

// This module intentionally has no Firebase imports. FirebaseStorage is a
// pure-Swift SPM product with no importable ObjC header, so `@import
// FirebaseStorage` cannot be used from an Objective-C++ (.mm) TurboModule
// (see docs/ios-spm.mdx and okf-bundle/ios-spm-native-imports.md). Every
// Firebase Storage SDK call is routed through the plain Objective-C
// RNFBStorageHelper class instead, which can safely `@import
// FirebaseStorage` because it compiles as ObjC, not ObjC++.
#import "RNFBStorageModule.h"
#import "RNFBStorageHelper.h"
#import "RNFBStorageTurboModules.h"

@implementation RNFBStorageModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboStorage);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboStorageSpecJSI>(params);
}

- (void)invalidate {
  [RNFBStorageHelper invalidate];
}

#pragma mark -
#pragma mark Firebase Storage Methods

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
 */
- (void)deleteObject:(NSString *)appName
                 url:(NSString *)url
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper deleteObject:appName url:url resolve:resolve reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
 */
- (void)getDownloadURL:(NSString *)appName
                   url:(NSString *)url
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper getDownloadURL:appName url:url resolve:resolve reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
 */
- (void)getMetadata:(NSString *)appName
                url:(NSString *)url
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper getMetadata:appName url:url resolve:resolve reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
 */
- (void)updateMetadata:(NSString *)appName
                   url:(NSString *)url
              metadata:(NSDictionary *_Nullable)metadata
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper updateMetadata:appName
                                url:url
                           metadata:metadata
                            resolve:resolve
                             reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#list
 */
- (void)list:(NSString *)appName
            url:(NSString *)url
    listOptions:(JS::NativeRNFBTurboStorage::StorageListOptions &)listOptions
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject {
  long maxResults = (long)listOptions.maxResults();
  NSString *pageToken = listOptions.pageToken();
  [RNFBStorageHelper list:appName
                      url:url
               maxResults:maxResults
                pageToken:pageToken
                  resolve:resolve
                   reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#listAll
 */
- (void)listAll:(NSString *)appName
            url:(NSString *)url
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper listAll:appName url:url resolve:resolve reject:reject];
}

/**
 * @url
 * https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
 */
- (void)setMaxDownloadRetryTime:(NSString *)appName
                   milliseconds:(double)milliseconds
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper setMaxDownloadRetryTime:appName
                                milliseconds:milliseconds
                                     resolve:resolve
                                      reject:reject];
}

/**
 * @url
 * https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
 */
- (void)setMaxOperationRetryTime:(NSString *)appName
                    milliseconds:(double)milliseconds
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper setMaxOperationRetryTime:appName
                                 milliseconds:milliseconds
                                      resolve:resolve
                                       reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
 */
- (void)setMaxUploadRetryTime:(NSString *)appName
                 milliseconds:(double)milliseconds
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper setMaxUploadRetryTime:appName
                              milliseconds:milliseconds
                                   resolve:resolve
                                    reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#downloadFile
 */
- (void)writeToFile:(NSString *)appName
                url:(NSString *)url
      localFilePath:(NSString *)localFilePath
             taskId:(double)taskId
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper writeToFile:appName
                             url:url
                   localFilePath:localFilePath
                          taskId:taskId
                         resolve:resolve
                          reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putFile
 */
- (void)putFile:(NSString *)appName
              url:(NSString *)url
    localFilePath:(NSString *)localFilePath
         metadata:(NSDictionary *_Nullable)metadata
           taskId:(double)taskId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper putFile:appName
                         url:url
               localFilePath:localFilePath
                    metadata:metadata
                      taskId:taskId
                     resolve:resolve
                      reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putFile
 */
- (void)putString:(NSString *)appName
              url:(NSString *)url
           string:(NSString *)string
           format:(NSString *)format
         metadata:(NSDictionary *_Nullable)metadata
           taskId:(double)taskId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  [RNFBStorageHelper putString:appName
                           url:url
                        string:string
                        format:format
                      metadata:metadata
                        taskId:taskId
                       resolve:resolve
                        reject:reject];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#useEmulator
 */
- (void)useEmulator:(NSString *)appName
               host:(NSString *)host
               port:(double)port
          bucketUrl:(NSString *)bucketUrl {
  [RNFBStorageHelper useEmulator:appName host:host port:port bucketUrl:bucketUrl];
}

/**
 * @url N/A - RNFB Specific
 */
- (NSNumber *)setTaskStatus:(NSString *)appName taskId:(double)taskId status:(double)status {
  return [RNFBStorageHelper setTaskStatus:appName taskId:taskId status:status];
}

#pragma mark -
#pragma mark Constants

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboStorage::Constants>)constantsToExport {
  return [_RCTTypedModuleConstants
      newWithUnsafeDictionary:[RNFBStorageHelper storageConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboStorage::Constants>)getConstants {
  return [self constantsToExport];
}

@end
