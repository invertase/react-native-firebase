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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#else
@import FirebaseCore;
@import FirebaseStorage;
#endif
#import <React/RCTUtils.h>

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBRCTEventEmitter.h"
#import "RNFBStorageCommon.h"
#import "RNFBStorageHelper.h"

static NSString *const RNFB_STORAGE_EVENT = @"storage_event";
static NSString *const RNFB_STORAGE_STATE_CHANGED = @"state_changed";
static NSString *const RNFB_STORAGE_UPLOAD_SUCCESS = @"upload_success";
static NSString *const RNFB_STORAGE_UPLOAD_FAILURE = @"upload_failure";
static NSString *const RNFB_STORAGE_DOWNLOAD_SUCCESS = @"download_success";
static NSString *const RNFB_STORAGE_DOWNLOAD_FAILURE = @"download_failure";

static NSMutableDictionary *PENDING_TASKS;

// The iOS SDK has a short memory on settings, store these globally and set them in each time
static NSString *emulatorHost = nil;
static NSInteger emulatorPort = 0;
static NSMutableDictionary *emulatorConfigs;
static NSTimeInterval maxDownloadRetryTime = 600;
static NSTimeInterval maxUploadRetryTime = 600;
static NSTimeInterval maxOperationRetryTime = 120;

@implementation RNFBStorageHelper

#pragma mark -
#pragma mark Shared state

+ (void)initializeSharedStateOnce {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    PENDING_TASKS = [[NSMutableDictionary alloc] init];
    emulatorConfigs = [[NSMutableDictionary alloc] init];
  });
}

+ (void)invalidate {
  [self initializeSharedStateOnce];
  for (NSString *key in [PENDING_TASKS allKeys]) {
    [PENDING_TASKS removeObjectForKey:key];
  }
}

#pragma mark -
#pragma mark Firebase Storage Methods

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
 */
+ (void)deleteObject:(NSString *)appName
                 url:(NSString *)url
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  [storageReference deleteWithCompletion:^(NSError *_Nullable error) {
    if (error != nil) {
      [self promiseRejectStorageException:reject error:error];
    } else {
      resolve([NSNull null]);
    }
  }];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
 */
+ (void)getDownloadURL:(NSString *)appName
                   url:(NSString *)url
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  [storageReference downloadURLWithCompletion:^(NSURL *_Nullable URL, NSError *_Nullable error) {
    if (error != nil) {
      [self promiseRejectStorageException:reject error:error];
    } else {
      NSString *url = URL.absoluteString;

      if ([url rangeOfString:@":443"].location != NSNotFound) {
        NSRange replaceRange = [url rangeOfString:@":443"];
        url = [url stringByReplacingCharactersInRange:replaceRange withString:@""];
      }

      resolve(url);
    }
  }];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
 */
+ (void)getMetadata:(NSString *)appName
                url:(NSString *)url
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  [storageReference
      metadataWithCompletion:^(FIRStorageMetadata *_Nullable metadata, NSError *_Nullable error) {
        if (error != nil) {
          [self promiseRejectStorageException:reject error:error];
        } else {
          resolve([RNFBStorageCommon metadataToDict:metadata]);
        }
      }];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
 */
+ (NSDictionary *)decodedMetadataMap:(NSDictionary *_Nullable)metadata {
  if (metadata == nil) {
    return @{};
  }

  return [RNFBSharedUtils decodeNullSentinels:metadata];
}

+ (void)updateMetadata:(NSString *)appName
                   url:(NSString *)url
              metadata:(NSDictionary *_Nullable)metadata
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
  NSDictionary *metadataMap = [self decodedMetadataMap:metadata];

  [storageReference metadataWithCompletion:^(FIRStorageMetadata *_Nullable fetchedMetadata,
                                             NSError *_Nullable error) {
    if (error != nil) {
      [self promiseRejectStorageException:reject error:error];
    } else {
      FIRStorageMetadata *storageMetadata =
          [RNFBStorageCommon buildMetadataFromMap:metadataMap
                                 existingMetadata:fetchedMetadata
                                             path:[storageReference fullPath]];

      [storageReference updateMetadata:storageMetadata
                            completion:^(FIRStorageMetadata *_Nullable updatedMetadata,
                                         NSError *_Nullable error) {
                              if (error != nil) {
                                [self promiseRejectStorageException:reject error:error];
                              } else {
                                resolve([RNFBStorageCommon metadataToDict:updatedMetadata]);
                              }
                            }];
    }
  }];
}

// list
+ (void)list:(NSString *)appName
           url:(NSString *)url
    maxResults:(long)maxResults
     pageToken:(NSString *_Nullable)pageToken
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  id completionBlock = ^(FIRStorageListResult *result, NSError *error) {
    if (error != nil) {
      [self promiseRejectStorageException:reject error:error];
    } else {
      resolve([RNFBStorageCommon listResultToDict:result]);
    }
  };

  if (pageToken != nil) {
    [storageReference listWithMaxResults:(int64_t)maxResults
                               pageToken:pageToken
                              completion:completionBlock];
  } else {
    [storageReference listWithMaxResults:(int64_t)maxResults completion:completionBlock];
  }
}

// listAll
+ (void)listAll:(NSString *)appName
            url:(NSString *)url
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  __block bool alreadyCompleted = false;

  id completionBlock = ^(FIRStorageListResult *result, NSError *error) {
    // This may be called multiple times if an error occurs
    // Make sure we won't try to resolve the promise twice in this case
    // TODO - remove pending resolution of firebase-ios-sdk issue 7197
    if (alreadyCompleted) {
      return;
    }
    alreadyCompleted = true;
    if (error != nil) {
      [self promiseRejectStorageException:reject error:error];
    } else {
      resolve([RNFBStorageCommon listResultToDict:result]);
    }
  };

  [storageReference listAllWithCompletion:completionBlock];
}

// setMaxDownloadRetryTime
+ (void)setMaxDownloadRetryTime:(NSString *)appName
                   milliseconds:(double)milliseconds
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  maxDownloadRetryTime = milliseconds / 1000;
  [[FIRStorage storageForApp:firebaseApp] setMaxDownloadRetryTime:milliseconds / 1000];
  resolve([NSNull null]);
}

// setMaxOperationRetryTime
+ (void)setMaxOperationRetryTime:(NSString *)appName
                    milliseconds:(double)milliseconds
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  maxOperationRetryTime = milliseconds / 1000;
  [[FIRStorage storageForApp:firebaseApp] setMaxOperationRetryTime:milliseconds / 1000];
  resolve([NSNull null]);
}

// setMaxUploadRetryTime
+ (void)setMaxUploadRetryTime:(NSString *)appName
                 milliseconds:(double)milliseconds
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  maxUploadRetryTime = milliseconds / 1000;
  [[FIRStorage storageForApp:firebaseApp] setMaxUploadRetryTime:milliseconds / 1000];
  resolve([NSNull null]);
}

// writeToFile
+ (void)writeToFile:(NSString *)appName
                url:(NSString *)url
      localFilePath:(NSString *)localFilePath
             taskId:(double)taskId
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [self initializeSharedStateOnce];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *taskIdNumber = @(taskId);
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
  NSURL *localFile = [NSURL fileURLWithPath:localFilePath];

  __block FIRStorageDownloadTask *downloadTask;
  RCTUnsafeExecuteOnMainQueueSync(^{
    downloadTask = [storageReference writeToFile:localFile];
  });

  PENDING_TASKS[taskIdNumber] = downloadTask;

  [downloadTask
      observeStatus:FIRStorageTaskStatusResume
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
            }];

  [downloadTask
      observeStatus:FIRStorageTaskStatusPause
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
            }];

  [downloadTask
      observeStatus:FIRStorageTaskStatusProgress
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
            }];

  [downloadTask
      observeStatus:FIRStorageTaskStatusSuccess
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              [PENDING_TASKS removeObjectForKey:taskIdNumber];

              NSDictionary *stateChangedEventBody =
                  [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *stateChangedEvent =
                  [RNFBStorageCommon getStorageEventDictionary:stateChangedEventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                         body:stateChangedEvent];

              NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_DOWNLOAD_SUCCESS
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
              resolve(eventBody);
            }];

  [downloadTask
      observeStatus:FIRStorageTaskStatusFailure
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              [PENDING_TASKS removeObjectForKey:taskIdNumber];

              NSDictionary *stateChangedEventBody =
                  [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *stateChangedEvent =
                  [RNFBStorageCommon getStorageEventDictionary:stateChangedEventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                         body:stateChangedEvent];

              NSMutableDictionary *taskSnapshotDict =
                  [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *eventBody = [RNFBStorageCommon buildErrorSnapshotDict:snapshot.error
                                                                 taskSnapshotDict:taskSnapshotDict];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_DOWNLOAD_FAILURE
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

              [self promiseRejectStorageException:reject error:snapshot.error];
            }];
}

// putFile
+ (void)putFile:(NSString *)appName
              url:(NSString *)url
    localFilePath:(NSString *)localFilePath
         metadata:(NSDictionary *_Nullable)metadata
           taskId:(double)taskId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *taskIdNumber = @(taskId);
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
  NSDictionary *metadataMap = [self decodedMetadataMap:metadata];
  FIRStorageMetadata *storageMetadata =
      [RNFBStorageCommon buildMetadataFromMap:metadataMap
                             existingMetadata:nil
                                         path:[storageReference fullPath]];

  [RNFBStorageCommon
      NSURLForLocalFilePath:localFilePath
                 completion:^(NSArray *errorCodeMessageArray, NSURL *temporaryFileUrl,
                              NSString *contentType) {
                   if (errorCodeMessageArray != nil) {
                     NSMutableDictionary *taskSnapshotDict =
                         [RNFBStorageCommon getUploadTaskAsDictionary:nil];
                     NSDictionary *eventBody = [RNFBStorageCommon
                         buildErrorSnapshotDictFromCodeAndMessage:errorCodeMessageArray
                                                 taskSnapshotDict:taskSnapshotDict];
                     NSDictionary *stateChangedEvent = [RNFBStorageCommon
                         getStorageEventDictionary:eventBody
                                 internalEventName:RNFB_STORAGE_STATE_CHANGED
                                           appName:[[[storageReference storage] app] name]
                                            taskId:taskIdNumber];
                     [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                                body:stateChangedEvent];

                     NSDictionary *event = [RNFBStorageCommon
                         getStorageEventDictionary:eventBody
                                 internalEventName:RNFB_STORAGE_UPLOAD_FAILURE
                                           appName:[[[storageReference storage] app] name]
                                            taskId:taskIdNumber];
                     [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

                     [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                                       userInfo:(NSMutableDictionary *)@{
                                                         @"code" : errorCodeMessageArray[0],
                                                         @"message" : errorCodeMessageArray[1],
                                                       }];
                     return;
                   }

                   storageMetadata.contentType = contentType;

                   if ([storageMetadata valueForKey:@"contentType"] == nil) {
                     storageMetadata.contentType =
                         [RNFBStorageCommon mimeTypeForPath:localFilePath];
                   }

                   __block FIRStorageUploadTask *uploadTask;
                   RCTUnsafeExecuteOnMainQueueSync(^{
                     uploadTask = [storageReference putFile:temporaryFileUrl
                                                   metadata:storageMetadata];
                   });

                   [self addUploadTaskObservers:uploadTask
                                 appDisplayName:[[[storageReference storage] app] name]
                                         taskId:taskIdNumber
                                       resolver:resolve
                                       rejecter:reject];
                 }];
}

// putString
+ (void)putString:(NSString *)appName
              url:(NSString *)url
           string:(NSString *)string
           format:(NSString *)format
         metadata:(NSDictionary *_Nullable)metadata
           taskId:(double)taskId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *taskIdNumber = @(taskId);
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
  NSDictionary *metadataMap = [self decodedMetadataMap:metadata];
  FIRStorageMetadata *storageMetadata =
      [RNFBStorageCommon buildMetadataFromMap:metadataMap
                             existingMetadata:nil
                                         path:[storageReference fullPath]];

  __block FIRStorageUploadTask *uploadTask;
  RCTUnsafeExecuteOnMainQueueSync(^{
    uploadTask = [storageReference putData:[RNFBStorageCommon NSDataFromUploadString:string
                                                                              format:format]
                                  metadata:storageMetadata];
  });

  [self addUploadTaskObservers:uploadTask
                appDisplayName:[[[storageReference storage] app] name]
                        taskId:taskIdNumber
                      resolver:resolve
                      rejecter:reject];
}

// useEmulator
+ (void)useEmulator:(NSString *)appName
               host:(NSString *)host
               port:(double)port
          bucketUrl:(NSString *)bucketUrl {
  [self initializeSharedStateOnce];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  emulatorHost = host;
  emulatorPort = (NSInteger)port;
  NSString *key = [self createEmulatorKey:bucketUrl appName:firebaseApp.name];

  if (!emulatorConfigs[key]) {
    [[FIRStorage storageForApp:firebaseApp URL:bucketUrl] useEmulatorWithHost:host
                                                                         port:(NSInteger)port];
    emulatorConfigs[key] = @YES;
  }
}

// setTaskStatus
+ (NSNumber *)setTaskStatus:(NSString *)appName taskId:(double)taskId status:(double)status {
  [self initializeSharedStateOnce];
  NSNumber *taskIdNumber = @(taskId);
  id task = PENDING_TASKS[taskIdNumber];
  if (task == nil) {
    return @NO;
  }

  FIRStorageTaskSnapshot *snapshot = nil;
  if ([task isKindOfClass:[FIRStorageUploadTask class]]) {
    snapshot = [(FIRStorageUploadTask *)task snapshot];
  } else if ([task isKindOfClass:[FIRStorageDownloadTask class]]) {
    snapshot = [(FIRStorageDownloadTask *)task snapshot];
  } else {
    return @NO;
  }

  FIRStorageTaskStatus currentStatus = snapshot.status;

  switch ((NSInteger)status) {
    case 0:
      if (currentStatus != FIRStorageTaskStatusPause &&
          (currentStatus == FIRStorageTaskStatusResume ||
           currentStatus == FIRStorageTaskStatusProgress)) {
        if ([task isKindOfClass:[FIRStorageDownloadTask class]]) {
          [(FIRStorageDownloadTask *)task pause];
        } else {
          [(FIRStorageUploadTask *)task pause];
        }
        return @YES;
      }
      return @NO;
    case 1:
      if (currentStatus == FIRStorageTaskStatusPause) {
        if ([task isKindOfClass:[FIRStorageDownloadTask class]]) {
          [(FIRStorageDownloadTask *)task resume];
        } else {
          [(FIRStorageUploadTask *)task resume];
        }
        return @YES;
      }
      return @NO;
    case 2:
      if (currentStatus != FIRStorageTaskStatusSuccess &&
          currentStatus != FIRStorageTaskStatusFailure &&
          (currentStatus == FIRStorageTaskStatusResume ||
           currentStatus == FIRStorageTaskStatusProgress ||
           currentStatus == FIRStorageTaskStatusPause)) {
        [PENDING_TASKS removeObjectForKey:taskIdNumber];
        if ([task isKindOfClass:[FIRStorageDownloadTask class]]) {
          [(FIRStorageDownloadTask *)task cancel];
        } else {
          [(FIRStorageUploadTask *)task cancel];
        }
        return @YES;
      }
      return @NO;
    default:
      return @NO;
  }
}

// storageConstantsDictionary
+ (NSDictionary *)storageConstantsDictionary {
  NSMutableDictionary *constants = [@{} mutableCopy];

  if ([[[FIRApp allApps] allKeys] count] > 0) {
    FIRStorage *storageInstance = [FIRStorage storage];
    constants[@"maxDownloadRetryTime"] =
        @((NSInteger)[storageInstance maxDownloadRetryTime] * 1000);
    constants[@"maxOperationRetryTime"] =
        @((NSInteger)[storageInstance maxOperationRetryTime] * 1000);
    constants[@"maxUploadRetryTime"] = @((NSInteger)[storageInstance maxUploadRetryTime] * 1000);
  } else {
    constants[@"maxDownloadRetryTime"] = @0;
    constants[@"maxOperationRetryTime"] = @0;
    constants[@"maxUploadRetryTime"] = @0;
  }

  return constants;
}

#pragma mark -
#pragma mark Firebase Storage Internals

// createEmulatorKey
+ (NSString *)createEmulatorKey:(NSString *)bucketUrl appName:(NSString *)appName {
  return [NSString stringWithFormat:@"%@-%@", appName, bucketUrl];
}

// addUploadTaskObservers
+ (void)addUploadTaskObservers:(FIRStorageUploadTask *)uploadTask
                appDisplayName:(NSString *)appDisplayName
                        taskId:(NSNumber *)taskId
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject {
  [self initializeSharedStateOnce];
  PENDING_TASKS[taskId] = uploadTask;

  [uploadTask
      observeStatus:FIRStorageTaskStatusResume
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              NSDictionary *eventBody = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:appDisplayName
                                                        taskId:taskId];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
            }];

  [uploadTask
      observeStatus:FIRStorageTaskStatusPause
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              NSDictionary *eventBody = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:appDisplayName
                                                        taskId:taskId];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
            }];

  [uploadTask
      observeStatus:FIRStorageTaskStatusProgress
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              NSDictionary *eventBody = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:appDisplayName
                                                        taskId:taskId];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
            }];

  [uploadTask observeStatus:FIRStorageTaskStatusSuccess
                    handler:^(FIRStorageTaskSnapshot *snapshot) {
                      [PENDING_TASKS removeObjectForKey:taskId];

                      NSDictionary *eventBody =
                          [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];

                      NSDictionary *stateChangeEvent =
                          [RNFBStorageCommon getStorageEventDictionary:eventBody
                                                     internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                               appName:appDisplayName
                                                                taskId:taskId];
                      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                                 body:stateChangeEvent];

                      NSDictionary *uploadSuccessEvent =
                          [RNFBStorageCommon getStorageEventDictionary:eventBody
                                                     internalEventName:RNFB_STORAGE_UPLOAD_SUCCESS
                                                               appName:appDisplayName
                                                                taskId:taskId];
                      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                                 body:uploadSuccessEvent];
                      resolve(eventBody);
                    }];

  [uploadTask
      observeStatus:FIRStorageTaskStatusFailure
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              [PENDING_TASKS removeObjectForKey:taskId];

              NSMutableDictionary *taskSnapshotDict =
                  [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
              NSDictionary *stateChangedEvtBody =
                  [RNFBStorageCommon buildErrorSnapshotDict:snapshot.error
                                           taskSnapshotDict:taskSnapshotDict];
              NSDictionary *stateChangedEvent =
                  [RNFBStorageCommon getStorageEventDictionary:stateChangedEvtBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:appDisplayName
                                                        taskId:taskId];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                         body:stateChangedEvent];

              NSDictionary *eventBody = [RNFBStorageCommon buildErrorSnapshotDict:snapshot.error
                                                                 taskSnapshotDict:taskSnapshotDict];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_UPLOAD_FAILURE
                                                       appName:appDisplayName
                                                        taskId:taskId];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

              [self promiseRejectStorageException:reject error:snapshot.error];
            }];
}

// getReferenceFromUrl
+ (FIRStorageReference *)getReferenceFromUrl:(NSString *)url app:(FIRApp *)firebaseApp {
  [self initializeSharedStateOnce];
  FIRStorage *storage;
  NSString *pathWithBucketName = [url substringWithRange:NSMakeRange(5, [url length] - 5)];
  NSString *bucket = url;
  NSRange rangeOfSlash = [pathWithBucketName rangeOfString:@"/"];
  if (rangeOfSlash.location != NSNotFound) {
    bucket = [url substringWithRange:NSMakeRange(0, rangeOfSlash.location + 5)];
  }
  storage = [FIRStorage storageForApp:firebaseApp URL:bucket];

  NSString *key = [self createEmulatorKey:bucket appName:firebaseApp.name];
  if (![emulatorHost isEqual:[NSNull null]] && emulatorHost != nil && !emulatorConfigs[key]) {
    @try {
      [storage useEmulatorWithHost:emulatorHost port:emulatorPort];
      emulatorConfigs[key] = @YES;
    } @catch (NSException *e) {
      NSLog(@"WARNING: Unable to set the Firebase Storage emulator settings. These must be set "
            @"before any usages of Firebase Storage. If you see this log after a hot "
            @"reload/restart you can safely ignore it.");
    }
  }
  return [storage referenceForURL:url];
}

// promiseRejectStorageException
+ (void)promiseRejectStorageException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  NSArray *codeAndMessage = [RNFBStorageCommon getErrorCodeMessage:error];
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                    userInfo:(NSMutableDictionary *)@{
                                      @"code" : (NSString *)codeAndMessage[0],
                                      @"message" : (NSString *)codeAndMessage[1],
                                    }];
}

@end
