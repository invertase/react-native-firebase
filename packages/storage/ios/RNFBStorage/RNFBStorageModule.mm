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

#import <Firebase/Firebase.h>
#import <React/RCTUtils.h>

#import "RNFBRCTEventEmitter.h"
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBStorageCommon.h"
#import "RNFBStorageModule.h"
#import "RNFBStorageTurboModules.h"

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

- (id)init {
  self = [super init];

  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    PENDING_TASKS = [[NSMutableDictionary alloc] init];
    emulatorConfigs = [[NSMutableDictionary alloc] init];
  });

  return self;
}

- (void)dealloc {
  for (NSString *key in [PENDING_TASKS allKeys]) {
    [PENDING_TASKS removeObjectForKey:key];
  }
}

- (void)invalidate {
  for (NSString *key in [PENDING_TASKS allKeys]) {
    [PENDING_TASKS removeObjectForKey:key];
  }
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
- (void)getDownloadURL:(NSString *)appName
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
- (void)getMetadata:(NSString *)appName
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
- (NSDictionary *)decodedMetadataMap:(NSDictionary *_Nullable)metadata {
  if (metadata == nil) {
    return @{};
  }

  return [RNFBSharedUtils decodeNullSentinels:metadata];
}

- (void)updateMetadata:(NSString *)appName
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

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#list
 */
- (void)list:(NSString *)appName
         url:(NSString *)url
 listOptions:(JS::NativeRNFBTurboStorage::StorageListOptions &)listOptions
     resolve:(RCTPromiseResolveBlock)resolve
      reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
  long maxResults = (long)listOptions.maxResults();

  id completionBlock = ^(FIRStorageListResult *result, NSError *error) {
    if (error != nil) {
      [self promiseRejectStorageException:reject error:error];
    } else {
      NSDictionary *listResultDict = [RNFBStorageCommon listResultToDict:result];
      resolve(listResultDict);
    }
  };

  NSString *pageToken = listOptions.pageToken();
  if (pageToken != nil) {
    [storageReference listWithMaxResults:(int64_t)maxResults
                               pageToken:pageToken
                              completion:completionBlock];
  } else {
    [storageReference listWithMaxResults:(int64_t)maxResults completion:completionBlock];
  }
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#listAll
 */
- (void)listAll:(NSString *)appName
            url:(NSString *)url
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  __block bool alreadyCompleted = false;

  id completionBlock = ^(FIRStorageListResult *result, NSError *error) {
    // This may be called multiple times if an error occurs
    // Make sure we won't try to resolve the promise twice in this case
    // TODO - remove pending resolution of https://github.com/firebase/firebase-ios-sdk/issues/7197
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

/**
 * @url
 * https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
 */
- (void)setMaxDownloadRetryTime:(NSString *)appName
                   milliseconds:(double)milliseconds
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  maxDownloadRetryTime = milliseconds / 1000;
  [[FIRStorage storageForApp:firebaseApp] setMaxDownloadRetryTime:milliseconds / 1000];
  resolve([NSNull null]);
}

/**
 * @url
 * https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
 */
- (void)setMaxOperationRetryTime:(NSString *)appName
                    milliseconds:(double)milliseconds
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  maxOperationRetryTime = milliseconds / 1000;
  [[FIRStorage storageForApp:firebaseApp] setMaxOperationRetryTime:milliseconds / 1000];
  resolve([NSNull null]);
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
 */
- (void)setMaxUploadRetryTime:(NSString *)appName
                 milliseconds:(double)milliseconds
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  maxUploadRetryTime = milliseconds / 1000;
  [[FIRStorage storageForApp:firebaseApp] setMaxUploadRetryTime:milliseconds / 1000];
  resolve([NSNull null]);
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
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *taskIdNumber = @(taskId);
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
  NSURL *localFile = [NSURL fileURLWithPath:localFilePath];

  __block FIRStorageDownloadTask *downloadTask;
  RCTUnsafeExecuteOnMainQueueSync(^{
    downloadTask = [storageReference writeToFile:localFile];
  });

  PENDING_TASKS[taskIdNumber] = downloadTask;

  // download started or resumed
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

  // download paused
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

  // download reported progress
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

  // download completed successfully
  [downloadTask
      observeStatus:FIRStorageTaskStatusSuccess
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              [PENDING_TASKS removeObjectForKey:taskIdNumber];

              // state_changed
              NSDictionary *stateChangedEventBody =
                  [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *stateChangedEvent =
                  [RNFBStorageCommon getStorageEventDictionary:stateChangedEventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                         body:stateChangedEvent];

              // download_success
              NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *event =
                  [RNFBStorageCommon getStorageEventDictionary:eventBody
                                             internalEventName:RNFB_STORAGE_DOWNLOAD_SUCCESS
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
              resolve(eventBody);
            }];

  // download task failed
  [downloadTask
      observeStatus:FIRStorageTaskStatusFailure
            handler:^(FIRStorageTaskSnapshot *snapshot) {
              [PENDING_TASKS removeObjectForKey:taskIdNumber];

              // state_changed
              NSDictionary *stateChangedEventBody =
                  [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
              NSDictionary *stateChangedEvent =
                  [RNFBStorageCommon getStorageEventDictionary:stateChangedEventBody
                                             internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                       appName:firebaseApp.name
                                                        taskId:taskIdNumber];
              [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                         body:stateChangedEvent];

              // download_failed
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
                     // state_changed
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

                     // upload_failed
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

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#useEmulator
 */
- (void)useEmulator:(NSString *)appName
               host:(NSString *)host
               port:(double)port
          bucketUrl:(NSString *)bucketUrl {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  emulatorHost = host;
  emulatorPort = (NSInteger)port;
  NSString *key = [self createEmulatorKey:bucketUrl appName:firebaseApp.name];

  if (!emulatorConfigs[key]) {
    [[FIRStorage storageForApp:firebaseApp URL:bucketUrl] useEmulatorWithHost:host port:(NSInteger)port];
    emulatorConfigs[key] = @YES;
  }
}

/**
 * @url N/A - RNFB Specific
 */
- (void)setTaskStatus:(NSString *)appName
               taskId:(double)taskId
               status:(double)status
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  NSNumber *taskIdNumber = @(taskId);
  id task = PENDING_TASKS[taskIdNumber];
  if (task == nil) {
    resolve(@(NO));
    return;
  }

  switch ((NSInteger)status) {
    case 0:
      [task pause];
      break;
    case 1:
      if ([task isKindOfClass:[FIRStorageDownloadTask class]]) {
        [(FIRStorageDownloadTask *)task resume];
      } else {
        [(FIRStorageUploadTask *)task resume];
      }
      break;
    case 2:
      [task cancel];
      break;
    default:
      break;
  }
}

#pragma mark -
#pragma mark Firebase Storage Internals

- (NSString *)createEmulatorKey:(NSString *)bucketUrl appName:(NSString *)appName {
  return [NSString stringWithFormat:@"%@-%@", appName, bucketUrl];
}

- (void)addUploadTaskObservers:(FIRStorageUploadTask *)uploadTask
                appDisplayName:(NSString *)appDisplayName
                        taskId:(NSNumber *)taskId
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject {
  PENDING_TASKS[taskId] = uploadTask;

  // upload started or resumed
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

  // upload paused
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

  // upload reported progress
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

  // upload completed successfully
  [uploadTask observeStatus:FIRStorageTaskStatusSuccess
                    handler:^(FIRStorageTaskSnapshot *snapshot) {
                      [PENDING_TASKS removeObjectForKey:taskId];

                      NSDictionary *eventBody =
                          [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];

                      // state_changed
                      NSDictionary *stateChangeEvent =
                          [RNFBStorageCommon getStorageEventDictionary:eventBody
                                                     internalEventName:RNFB_STORAGE_STATE_CHANGED
                                                               appName:appDisplayName
                                                                taskId:taskId];
                      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT
                                                                 body:stateChangeEvent];

                      // upload_success
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

              // state_changed
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

              // upload_failed
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

- (FIRStorageReference *)getReferenceFromUrl:(NSString *)url app:(FIRApp *)firebaseApp {
  FIRStorage *storage;
  NSString *pathWithBucketName = [url substringWithRange:NSMakeRange(5, [url length] - 5)];
  NSString *bucket = url;
  NSRange rangeOfSlash = [pathWithBucketName rangeOfString:@"/"];
  if (rangeOfSlash.location != NSNotFound) {
    bucket = [url substringWithRange:NSMakeRange(0, rangeOfSlash.location + 5)];
  }
  storage = [FIRStorage storageForApp:firebaseApp URL:bucket];

  NSLog(@"Setting emulator - host %@ port %ld", emulatorHost, (long)emulatorPort);
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

- (void)promiseRejectStorageException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  NSArray *codeAndMessage = [RNFBStorageCommon getErrorCodeMessage:error];
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                    userInfo:(NSMutableDictionary *)@{
                                      @"code" : (NSString *)codeAndMessage[0],
                                      @"message" : (NSString *)codeAndMessage[1],
                                    }];
}

- (NSDictionary *)storageConstantsDictionary {
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

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboStorage::Constants::Builder>)
    constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:[self storageConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboStorage::Constants::Builder>)
    getConstants {
  return [self constantsToExport];
}

@end
