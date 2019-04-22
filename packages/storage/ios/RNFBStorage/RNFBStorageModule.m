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

#import <React/RCTUtils.h>
#import <Photos/Photos.h>
#import <Firebase/Firebase.h>

#import "RNFBStorageModule.h"
#import "RNFBRCTEventEmitter.h"
#import "RNFBStorageCommon.h"
#import "RNFBSharedUtils.h"

@implementation RNFBStorageModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase Storage Methods

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
 */
RCT_EXPORT_METHOD(delete:
  (FIRApp *) firebaseApp
    : (NSString *) url
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  [storageReference deleteWithCompletion:^(NSError *_Nullable error) {
    if (error != nil) {
      // TODO(salakar): move to new error rejection utils
      [self promiseRejectStorageException:reject error:error];
    } else {
      resolve([NSNull null]);
    }
  }];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
 */
RCT_EXPORT_METHOD(getDownloadURL:
  (FIRApp *) firebaseApp
    : (NSString *) url
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  [storageReference downloadURLWithCompletion:^(NSURL *_Nullable URL, NSError *_Nullable error) {
    if (error != nil) {
      // TODO(salakar): move to new error rejection utils
      [self promiseRejectStorageException:reject error:error];
    } else {
      resolve([URL absoluteString]);
    }
  }];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
 */
RCT_EXPORT_METHOD(getMetadata:
  (FIRApp *) firebaseApp
    : (NSString *) url
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  [storageReference metadataWithCompletion:^(FIRStorageMetadata *_Nullable metadata, NSError *_Nullable error) {
    if (error != nil) {
      // TODO(salakar): move to new error rejection utils
      [self promiseRejectStorageException:reject error:error];
    } else {
      resolve([metadata dictionaryRepresentation]);
    }
  }];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
 */
RCT_EXPORT_METHOD(updateMetadata:
  (FIRApp *) firebaseApp
    : (NSString *) url
    : (NSDictionary *) metadata
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
  FIRStorageMetadata *storageMetadata = [RNFBStorageCommon buildMetadataFromMap:metadata];

  [storageReference updateMetadata:storageMetadata completion:^(
      FIRStorageMetadata *_Nullable metadata,
      NSError *_Nullable error
  ) {
    if (error != nil) {
      [self promiseRejectStorageException:reject error:error];
    } else {
      resolve([metadata dictionaryRepresentation]);
    }
  }];
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
 */
RCT_EXPORT_METHOD(setMaxDownloadRetryTime:
  (FIRApp *) firebaseApp
    : (nonnull NSNumber *) milliseconds
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  [[FIRStorage storageForApp:firebaseApp] setMaxDownloadRetryTime:[milliseconds doubleValue]];
  resolve([NSNull null]);
}


/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
 */
RCT_EXPORT_METHOD(setMaxOperationRetryTime:
  (FIRApp *) firebaseApp
    : (nonnull  NSNumber *) milliseconds
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  [[FIRStorage storageForApp:firebaseApp] setMaxOperationRetryTime:[milliseconds doubleValue]];
  resolve([NSNull null]);
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
 */
RCT_EXPORT_METHOD(setMaxUploadRetryTime:
  (FIRApp *) firebaseApp
    : (nonnull NSNumber *) milliseconds
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  [[FIRStorage storageForApp:firebaseApp] setMaxUploadRetryTime:[milliseconds doubleValue]];
  resolve([NSNull null]);
}

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#downloadFile
 */
RCT_EXPORT_METHOD(getFile:
  (FIRApp *) firebaseApp
    : (NSString *) url
    : (NSString *) localFilePath
    : (nonnull NSNumber *) taskId
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
  NSURL *localFile = [NSURL fileURLWithPath:localFilePath];

  __block FIRStorageDownloadTask *downloadTask;
  RCTUnsafeExecuteOnMainQueueSync(^{
    downloadTask = [storageReference writeToFile:localFile];
  });

  // download started or resumed
  [downloadTask observeStatus:FIRStorageTaskStatusResume handler:^(FIRStorageTaskSnapshot *snapshot) {
    NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
  }];

  // download paused
  [downloadTask observeStatus:FIRStorageTaskStatusPause handler:^(FIRStorageTaskSnapshot *snapshot) {
    NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
  }];

  // download reported progress
  [downloadTask observeStatus:FIRStorageTaskStatusProgress handler:^(FIRStorageTaskSnapshot *snapshot) {
    NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
  }];

  // download completed successfully
  [downloadTask observeStatus:FIRStorageTaskStatusSuccess handler:^(FIRStorageTaskSnapshot *snapshot) {
    // state_changed
    NSDictionary *stateChangedEventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
    NSDictionary *stateChangedEvent =
        [RNFBStorageCommon getStorageEventDictionary:stateChangedEventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:stateChangedEvent];

    // download_success
    NSDictionary *eventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_DOWNLOAD_SUCCESS appName:firebaseApp.name taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
    resolve(eventBody);
  }];

  // download task failed
  [downloadTask observeStatus:FIRStorageTaskStatusFailure handler:^(FIRStorageTaskSnapshot *snapshot) {
    // state_changed
    NSDictionary *stateChangedEventBody = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
    NSDictionary *stateChangedEvent =
        [RNFBStorageCommon getStorageEventDictionary:stateChangedEventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:stateChangedEvent];

    // download_failed
    NSMutableDictionary *taskSnapshotDict = [RNFBStorageCommon getDownloadTaskAsDictionary:snapshot];
    NSDictionary
        *eventBody = [RNFBStorageCommon buildErrorSnapshotDict:snapshot.error taskSnapshotDict:taskSnapshotDict];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_DOWNLOAD_FAILURE appName:firebaseApp.name taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

    // TODO sendJSError event
    if (snapshot.error != nil) {
      [self promiseRejectStorageException:reject error:snapshot.error];
    }
  }];
}


/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putFile
 */
RCT_EXPORT_METHOD(putFile:
  (FIRApp *) firebaseApp
    : (NSString *) url
    : (NSString *) localFilePath
    : (NSDictionary *) metadata
    : (nonnull NSNumber *) taskId
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  FIRStorageMetadata *storageMetadata = [RNFBStorageCommon buildMetadataFromMap:metadata];
  FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

  if ([RNFBStorageCommon isRemoteAsset:localFilePath]) {
    PHAsset *asset = [RNFBStorageCommon fetchAssetForPath:localFilePath];
    NSURL *temporaryFileUrl = [RNFBStorageCommon createTempFileUrl];
    [RNFBStorageCommon downloadAsset:asset toURL:temporaryFileUrl completion:^(NSError *downloadError) {
      [self uploadFile:storageReference storageMetadata:storageMetadata localFilePath:temporaryFileUrl taskId:taskId resolver:resolve rejecter:reject];
    }];
  } else {
    if (![[NSFileManager defaultManager] fileExistsAtPath:localFilePath]) {
      reject(@"storage/file-not-found", @"File specified at path does not exist.", nil);
    } else {
      NSURL *fileUrl = [NSURL fileURLWithPath:localFilePath];

      if ([storageMetadata valueForKey:@"contentType"] == nil) {
        storageMetadata.contentType = [RNFBStorageCommon mimeTypeForPath:localFilePath];
      }

      [self uploadFile:storageReference storageMetadata:storageMetadata localFilePath:fileUrl taskId:taskId resolver:resolve rejecter:reject];
    }
  }
}

#pragma mark -
#pragma mark Firebase Storage Internals

- (void)uploadFile:(FIRStorageReference *)storageReference storageMetadata:(FIRStorageMetadata *)storageMetadata localFilePath:(NSURL *)localFilePath taskId:(NSNumber *)taskId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
  __block FIRStorageUploadTask *uploadTask;
  RCTUnsafeExecuteOnMainQueueSync(^{
    uploadTask = [storageReference putFile:localFilePath metadata:storageMetadata];
  });
  [self addUploadTaskObservers:uploadTask appDisplayName:[[[storageReference storage] app] name] taskId:taskId resolver:resolve rejecter:reject];
}

- (void)addUploadTaskObservers:(FIRStorageUploadTask *)uploadTask appDisplayName:(NSString *)appDisplayName taskId:(NSNumber *)taskId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
  // upload started or resumed
  [uploadTask observeStatus:FIRStorageTaskStatusResume handler:^(FIRStorageTaskSnapshot *snapshot) {
    NSDictionary *eventBody = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

  }];

  // upload paused
  [uploadTask observeStatus:FIRStorageTaskStatusPause handler:^(FIRStorageTaskSnapshot *snapshot) {
    NSDictionary *eventBody = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

  }];

  // upload reported progress
  [uploadTask observeStatus:FIRStorageTaskStatusProgress handler:^(FIRStorageTaskSnapshot *snapshot) {
    NSDictionary *eventBody = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
  }];

  // upload completed successfully
  [uploadTask observeStatus:FIRStorageTaskStatusSuccess handler:^(FIRStorageTaskSnapshot *snapshot) {
    NSDictionary *eventBody = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];

    // state_changed
    NSDictionary *stateChangeEvent =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:stateChangeEvent];

    // upload_success
    NSDictionary *uploadSuccessEvent =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_UPLOAD_SUCCESS appName:appDisplayName taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:uploadSuccessEvent];
    resolve(eventBody);
  }];

  [uploadTask observeStatus:FIRStorageTaskStatusFailure handler:^(FIRStorageTaskSnapshot *snapshot) {
    // state_changed
    NSDictionary *stateChangedEventBody = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
    NSDictionary *stateChangedEvent =
        [RNFBStorageCommon getStorageEventDictionary:stateChangedEventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:stateChangedEvent];

    // upload_failed
    NSMutableDictionary *taskSnapshotDict = [RNFBStorageCommon getUploadTaskAsDictionary:snapshot];
    NSDictionary
        *eventBody = [RNFBStorageCommon buildErrorSnapshotDict:snapshot.error taskSnapshotDict:taskSnapshotDict];
    NSDictionary *event =
        [RNFBStorageCommon getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_UPLOAD_FAILURE appName:appDisplayName taskId:taskId];
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

    if (snapshot.error != nil) {
      [self promiseRejectStorageException:reject error:snapshot.error];
    }
  }];
}

- (FIRStorageReference *)getReferenceFromUrl:(NSString *)url app:(FIRApp *)firebaseApp {
  NSString *pathWithBucketName = [url substringWithRange:NSMakeRange(5, [url length] - 5)];
  NSString *bucket = [url substringWithRange:NSMakeRange(0, [pathWithBucketName rangeOfString:@"/"].location + 5)];
  return [[FIRStorage storageForApp:firebaseApp URL:bucket] referenceForURL:url];
}

- (void)promiseRejectStorageException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  NSArray *codeAndMessage = [RNFBStorageCommon getErrorCodeMessage:error];
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
      @"code": codeAndMessage[0],
      @"message": codeAndMessage[1],
  }];
}

- (NSString *)getPathForDirectory:(int)directory {
  NSArray *paths = NSSearchPathForDirectoriesInDomains((NSSearchPathDirectory) directory, NSUserDomainMask, YES);
  return [paths firstObject];
}

- (NSDictionary *)constantsToExport {
  // TODO(salakar) clean me
  return @{
      @"MAIN_BUNDLE_PATH": [[NSBundle mainBundle] bundlePath],
      @"CACHES_DIRECTORY_PATH": [self getPathForDirectory:NSCachesDirectory],
      @"DOCUMENT_DIRECTORY_PATH": [self getPathForDirectory:NSDocumentDirectory],
      @"EXTERNAL_DIRECTORY_PATH": [NSNull null],
      @"EXTERNAL_STORAGE_DIRECTORY_PATH": [NSNull null],
      @"TEMP_DIRECTORY_PATH": NSTemporaryDirectory(),
      @"LIBRARY_DIRECTORY_PATH": [self getPathForDirectory:NSLibraryDirectory],
      @"FILETYPE_REGULAR": NSFileTypeRegular,
      @"FILETYPE_DIRECTORY": NSFileTypeDirectory
  };
}

@end
