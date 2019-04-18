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
#import <Firebase/Firebase.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <Photos/Photos.h>

#import "RNFBStorageModule.h"
#import "RNFBRCTEventEmitter.h"
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
                          url:
                          (NSString *) url
                          resolver:
                          (RCTPromiseResolveBlock) resolve
                          rejecter:
                          (RCTPromiseRejectBlock) reject) {
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
                          url:
                          (NSString *) url
                          resolver:
                          (RCTPromiseResolveBlock) resolve
                          rejecter:
                          (RCTPromiseRejectBlock) reject) {
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
                          url:
                          (NSString *) url
                          resolver:
                          (RCTPromiseResolveBlock) resolve
                          rejecter:
                          (RCTPromiseRejectBlock) reject) {
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
                          url:
                          (NSString *) url
                          metadata:
                          (NSDictionary *) metadata
                          resolver:
                          (RCTPromiseResolveBlock) resolve
                          rejecter:
                          (RCTPromiseRejectBlock) reject) {
    FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
    FIRStorageMetadata *storageMetadata = [self buildMetadataFromMap:metadata];

    [storageReference updateMetadata:storageMetadata completion:^(FIRStorageMetadata *_Nullable metadata,
                                                                  NSError *_Nullable error) {
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
                          milliseconds:
                          (nonnull
                        NSNumber *) milliseconds
                        resolver:
                    (RCTPromiseResolveBlock) resolve
                        rejecter:
                    (RCTPromiseRejectBlock) reject) {
    [[FIRStorage storageForApp:firebaseApp] setMaxDownloadRetryTime:[milliseconds doubleValue]];
    resolve([NSNull null]);
  }


  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
   */
  RCT_EXPORT_METHOD(setMaxOperationRetryTime:
                      (FIRApp *) firebaseApp
                          milliseconds:
                          (nonnull
                        NSNumber *) milliseconds
                        resolver:
                    (RCTPromiseResolveBlock) resolve
                        rejecter:
                    (RCTPromiseRejectBlock) reject) {
    [[FIRStorage storageForApp:firebaseApp] setMaxOperationRetryTime:[milliseconds doubleValue]];
    resolve([NSNull null]);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
   */
  RCT_EXPORT_METHOD(setMaxUploadRetryTime:
                      (FIRApp *) firebaseApp
                          milliseconds:
                          (nonnull
                        NSNumber *) milliseconds
                        resolver:
                    (RCTPromiseResolveBlock) resolve
                        rejecter:
                    (RCTPromiseRejectBlock) reject) {
    [[FIRStorage storageForApp:firebaseApp] setMaxUploadRetryTime:[milliseconds doubleValue]];
    resolve([NSNull null]);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#downloadFile
   */
  RCT_EXPORT_METHOD(getFile:
                      (FIRApp *) firebaseApp
                          url:
                          (NSString *) url
                          localFilePath:
                          (NSString *) localFilePath
                          taskId:
                          (nonnull
                        NSNumber *) taskId
                        resolver:(RCTPromiseResolveBlock) resolve
                        rejecter:(RCTPromiseRejectBlock) reject) {
    FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];
    NSURL *localFile = [NSURL fileURLWithPath:localFilePath];

    __block FIRStorageDownloadTask *downloadTask;
    RCTUnsafeExecuteOnMainQueueSync(^{
      downloadTask = [storageReference writeToFile:localFile];
    });

    // download started or resumed
    [downloadTask observeStatus:FIRStorageTaskStatusResume handler:^(FIRStorageTaskSnapshot *snapshot) {
      NSDictionary *eventBody = [self getDownloadTaskAsDictionary:snapshot];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
    }];

    // download paused
    [downloadTask observeStatus:FIRStorageTaskStatusPause handler:^(FIRStorageTaskSnapshot *snapshot) {
      NSDictionary *eventBody = [self getDownloadTaskAsDictionary:snapshot];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
    }];

    // download reported progress
    [downloadTask observeStatus:FIRStorageTaskStatusProgress handler:^(FIRStorageTaskSnapshot *snapshot) {
      NSDictionary *eventBody = [self getDownloadTaskAsDictionary:snapshot];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
    }];

    // download completed successfully
    [downloadTask observeStatus:FIRStorageTaskStatusSuccess handler:^(FIRStorageTaskSnapshot *snapshot) {
      // state_changed
      NSDictionary *stateChangedEventBody = [self getDownloadTaskAsDictionary:snapshot];
      NSDictionary *stateChangedEvent =
          [self getStorageEventDictionary:stateChangedEventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:stateChangedEvent];

      // download_success
      NSDictionary *eventBody = [self getDownloadTaskAsDictionary:snapshot];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_DOWNLOAD_SUCCESS appName:firebaseApp.name taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
      resolve(eventBody);
    }];

    // download task failed
    [downloadTask observeStatus:FIRStorageTaskStatusFailure handler:^(FIRStorageTaskSnapshot *snapshot) {
      // state_changed
      NSDictionary *stateChangedEventBody = [self getDownloadTaskAsDictionary:snapshot];
      NSDictionary *stateChangedEvent =
          [self getStorageEventDictionary:stateChangedEventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:firebaseApp.name taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:stateChangedEvent];

      // download_failed
      NSMutableDictionary *taskSnapshotDict = [self getDownloadTaskAsDictionary:snapshot];
      NSDictionary *eventBody = [self buildErrorSnapshotDict:snapshot.error taskSnapshotDict:taskSnapshotDict];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_DOWNLOAD_FAILURE appName:firebaseApp.name taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

      // TODO sendJSError event
      if (snapshot.error != nil) {
        [self promiseRejectStorageException:reject error:snapshot.error];
      }
    }];
  }


  /**
 putFile
 @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putFile
 @param NSString path
 @param NSString localPath
 @param NSDictionary metadata
 */
  // @formatter:off
  RCT_EXPORT_METHOD(
    putFile       : (FIRApp *) firebaseApp
    url           : (NSString *) url
    localFilePath : (NSString *) localFilePath
    metadata      : (NSDictionary *) metadata
    taskId        : (nonnull NSNumber *) taskId
    resolver      : (RCTPromiseResolveBlock) resolve
    rejecter      : (RCTPromiseRejectBlock) reject
  ) {
    // @formatter:on
    FIRStorageMetadata *storageMetadata = [self buildMetadataFromMap:metadata];
    FIRStorageReference *storageReference = [self getReferenceFromUrl:url app:firebaseApp];

    if ([localFilePath hasPrefix:@"assets-library://"] || [localFilePath hasPrefix:@"ph://"]) {
      PHFetchResult *assets;
      NSURL *temporaryFileUrl = [self temporaryFileUrl];

      if ([localFilePath hasPrefix:@"assets-library://"]) {
        NSURL *localFile = [[NSURL alloc] initWithString:localFilePath];
        assets = [PHAsset fetchAssetsWithALAssetURLs:@[localFile] options:nil];
      } else {
        NSString *assetId = [localFilePath substringFromIndex:@"ph://".length];
        assets = [PHAsset fetchAssetsWithLocalIdentifiers:@[assetId] options:nil];
      }

      PHAsset *asset = [assets firstObject];
      [self downloadAsset:asset toURL:temporaryFileUrl completion:^(NSError *downloadError) {
        [self uploadFile:storageReference storageMetadata:storageMetadata localFilePath:temporaryFileUrl taskId:taskId resolver:resolve rejecter:reject];
      }];

      return;
    }

    if (![[NSFileManager defaultManager] fileExistsAtPath:localFilePath]) {
      reject(@"storage/file-not-found", @"File specified at path does not exist.", nil);
      return;
    }

    NSURL *fileUrl = [NSURL fileURLWithPath:localFilePath];
    if ([storageMetadata valueForKey:@"contentType"] == nil) {
      storageMetadata.contentType = [self mimeTypeForPath:localFilePath];
    }

    [self uploadFile:storageReference storageMetadata:storageMetadata localFilePath:fileUrl taskId:taskId resolver:resolve rejecter:reject];
  }

#pragma mark -
#pragma mark Firebase Storage Internals

  - (void)downloadAsset:(PHAsset *)asset toURL:(NSURL *)url completion:(void (^)(NSError *downloadError))completion {
    if (asset.mediaType == PHAssetMediaTypeImage && (asset.mediaSubtypes & PHAssetMediaSubtypePhotoLive)) {
      PHLivePhotoRequestOptions *options = [PHLivePhotoRequestOptions new];
      options.networkAccessAllowed = YES;
      [[PHImageManager defaultManager] requestLivePhotoForAsset:asset targetSize:CGSizeZero contentMode:PHImageContentModeAspectFill options:options resultHandler:^(
          PHLivePhoto *_Nullable livePhoto,
          NSDictionary *_Nullable info) {
        if (info[PHImageErrorKey] == nil) {
          NSData *livePhotoData = [NSKeyedArchiver archivedDataWithRootObject:livePhoto];
          if ([[NSFileManager defaultManager] createFileAtPath:url.path contents:livePhotoData attributes:nil]) {
            NSLog(@"downloaded live photo:%@", url.path);
            completion(nil);
          }
        }
      }];
    } else if (asset.mediaType == PHAssetMediaTypeImage) {
      PHImageRequestOptions *options = [PHImageRequestOptions new];
      options.networkAccessAllowed = YES;
      [[PHImageManager defaultManager] requestImageDataForAsset:asset options:options resultHandler:^(NSData *_Nullable imageData,
                                                                                                      NSString *_Nullable dataUTI,
                                                                                                      UIImageOrientation orientation,
                                                                                                      NSDictionary *_Nullable info) {
        if (info[PHImageErrorKey] == nil
            && [[NSFileManager defaultManager] createFileAtPath:url.path contents:imageData attributes:nil]) {
          NSLog(@"downloaded photo:%@", url.path);
          completion(nil);
        }
      }];
    } else if (asset.mediaType == PHAssetMediaTypeVideo) {
      PHVideoRequestOptions *options = [PHVideoRequestOptions new];
      options.networkAccessAllowed = YES;
      [[PHImageManager defaultManager] requestExportSessionForVideo:asset options:options exportPreset:AVAssetExportPresetHighestQuality resultHandler:^(
          AVAssetExportSession *_Nullable exportSession,
          NSDictionary *_Nullable info) {
        if (info[PHImageErrorKey] == nil) {
          exportSession.outputURL = url;

          NSArray<PHAssetResource *> *resources = [PHAssetResource assetResourcesForAsset:asset];
          for (PHAssetResource *resource in resources) {
            exportSession.outputFileType = resource.uniformTypeIdentifier;
            if (exportSession.outputFileType != nil)
              break;
          }

          [exportSession exportAsynchronouslyWithCompletionHandler:^{
            if (exportSession.status == AVAssetExportSessionStatusCompleted) {
              NSLog(@"downloaded video:%@", url.path);
              completion(nil);
            }
          }];
        }
      }];
    } else {
      // TODO(salakar) unknown media type
    }
  }

  - (BOOL)isHeic:(NSString *)path {
    return [[path pathExtension] caseInsensitiveCompare:@"heic"] == NSOrderedSame;
  }

  - (NSString *)utiToMimeType:(NSString *)dataUTI {
    return (__bridge_transfer NSString *) UTTypeCopyPreferredTagWithClass((__bridge CFStringRef) dataUTI,
                                                                          kUTTagClassMIMEType);
  }

  - (NSURL *)temporaryFileUrl {
    NSString *filename = [NSString stringWithFormat:@"%@.tmp", [[NSProcessInfo processInfo] globallyUniqueString]];
    return [[NSURL fileURLWithPath:NSTemporaryDirectory()] URLByAppendingPathComponent:filename];
  }

  - (NSString *)mimeTypeForPath:(NSString *)path {
    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension,
                                                            (__bridge CFStringRef) [path pathExtension],
                                                            NULL);
    CFStringRef mimeType = UTTypeCopyPreferredTagWithClass(UTI, kUTTagClassMIMEType);
    CFRelease(UTI);

    if (!mimeType) {
      return @"application/octet-stream";
    }

    return (__bridge_transfer NSString *) mimeType;
  }

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
      NSDictionary *eventBody = [self getUploadTaskAsDictionary:snapshot];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

    }];

    // upload paused
    [uploadTask observeStatus:FIRStorageTaskStatusPause handler:^(FIRStorageTaskSnapshot *snapshot) {
      NSDictionary *eventBody = [self getUploadTaskAsDictionary:snapshot];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

    }];

    // upload reported progress
    [uploadTask observeStatus:FIRStorageTaskStatusProgress handler:^(FIRStorageTaskSnapshot *snapshot) {
      NSDictionary *eventBody = [self getUploadTaskAsDictionary:snapshot];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];
    }];

    // upload completed successfully
    [uploadTask observeStatus:FIRStorageTaskStatusSuccess handler:^(FIRStorageTaskSnapshot *snapshot) {
      NSDictionary *eventBody = [self getUploadTaskAsDictionary:snapshot];

      // state_changed
      NSDictionary *stateChangeEvent =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:stateChangeEvent];

      // upload_success
      NSDictionary *uploadSuccessEvent =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_UPLOAD_SUCCESS appName:appDisplayName taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:uploadSuccessEvent];
      resolve(eventBody);
    }];

    [uploadTask observeStatus:FIRStorageTaskStatusFailure handler:^(FIRStorageTaskSnapshot *snapshot) {
      // state_changed
      NSDictionary *stateChangedEventBody = [self getUploadTaskAsDictionary:snapshot];
      NSDictionary *stateChangedEvent =
          [self getStorageEventDictionary:stateChangedEventBody internalEventName:RNFB_STORAGE_STATE_CHANGED appName:appDisplayName taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:stateChangedEvent];

      // upload_failed
      NSMutableDictionary *taskSnapshotDict = [self getUploadTaskAsDictionary:snapshot];
      NSDictionary *eventBody = [self buildErrorSnapshotDict:snapshot.error taskSnapshotDict:taskSnapshotDict];
      NSDictionary *event =
          [self getStorageEventDictionary:eventBody internalEventName:RNFB_STORAGE_UPLOAD_FAILURE appName:appDisplayName taskId:taskId];
      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_STORAGE_EVENT body:event];

      if (snapshot.error != nil) {
        [self promiseRejectStorageException:reject error:snapshot.error];
      }
    }];
  }

  - (NSDictionary *)getStorageEventDictionary:(NSDictionary *)eventBody internalEventName:(NSString *)internalEventName appName:(NSString *)appName taskId:(NSNumber *)taskId {
    return @{
        @"taskId": @([taskId doubleValue]),
        @"body": eventBody,
        @"appName": [RNFBSharedUtils getAppJavaScriptName:appName],
        @"eventName": internalEventName,
    };
  }

  - (NSDictionary *)buildErrorSnapshotDict:(NSError *)error taskSnapshotDict:(NSMutableDictionary *)taskSnapshotDict {
    taskSnapshotDict[@"error"] = @{
        @"code": @"unknown", // TODO implement
        @"message": @"unknown", // TODO implement
        @"nativeErrorMessage": @"unknown" // TODO implement
    };
    taskSnapshotDict[@"state"] = @"error";
    return taskSnapshotDict;
  }

  - (NSMutableDictionary *)getUploadTaskAsDictionary:(FIRStorageTaskSnapshot *)task {
    NSDictionary *storageMetadata = [task.metadata dictionaryRepresentation];

    return (NSMutableDictionary *) @{
        @"bytesTransferred": @(task.progress.completedUnitCount),
        @"metadata": storageMetadata != nil ? storageMetadata : [NSNull null],
        @"state": [self getTaskStatus:task.status],
        @"totalBytes": @(task.progress.totalUnitCount)
    };
  }

  - (NSMutableDictionary *)getDownloadTaskAsDictionary:(FIRStorageTaskSnapshot *)task {
    if (task != nil) {
      return (NSMutableDictionary *) @{
          @"bytesTransferred": @(task.progress.completedUnitCount),
          @"state": [self getTaskStatus:task.status],
          @"totalBytes": @(task.progress.totalUnitCount)
      };
    } else {
      return (NSMutableDictionary *) @{
          @"bytesTransferred": @(0),
          @"state": [self getTaskStatus:nil],
          @"totalBytes": @(0)
      };
    }
  }

  - (NSString *)getTaskStatus:(FIRStorageTaskStatus)status {
    if (status == nil)
      return @"unknown";
    if (status == FIRStorageTaskStatusResume || status == FIRStorageTaskStatusProgress) {
      return @"running";
    } else if (status == FIRStorageTaskStatusPause) {
      return @"paused";
    } else if (status == FIRStorageTaskStatusSuccess) {
      return @"success";
    } else if (status == FIRStorageTaskStatusFailure) {
      return @"error";
    } else {
      return @"unknown";
    }
  }

  - (FIRStorageMetadata *)buildMetadataFromMap:(NSDictionary *)metadata {
    // TODO(salakar): update to use specific getters/setters rather than blanket initing with a dictionary
    // TODO(salakar): to fix conversion issues with timeCreated & updated, generation & metageneration
    FIRStorageMetadata *storageMetadata = [[FIRStorageMetadata alloc] initWithDictionary:metadata];
    storageMetadata.customMetadata = [metadata[@"customMetadata"] mutableCopy];
    return storageMetadata;
  }

  - (FIRStorageReference *)getReferenceFromUrl:(NSString *)url app:(FIRApp *)firebaseApp {
    NSString *pathWithBucketName = [url substringWithRange:NSMakeRange(5, [url length] - 5)];
    NSString *bucket = [url substringWithRange:NSMakeRange(0, [pathWithBucketName rangeOfString:@"/"].location + 5)];
    return [[FIRStorage storageForApp:firebaseApp URL:bucket] referenceForURL:url];
  }

  // TODO(salakar): move to new error rejection utils
  - (void)promiseRejectStorageException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
    NSString *code = @"storage/unknown";
    NSString *message = [error localizedDescription];

    NSDictionary *userInfo = [error userInfo];
    NSError *underlyingError = userInfo[NSUnderlyingErrorKey];
    NSString *underlyingErrorDescription = [underlyingError localizedDescription];

    switch (error.code) {
    case FIRStorageErrorCodeUnknown:
      if ([underlyingErrorDescription isEqualToString:@"The operation couldn’t be completed. Permission denied"]) {
        code = @"storage/invalid-device-file-path";
        message = @"The specified device file path is invalid or is restricted.";
      } else {
        code = @"storage/unknown";
        message = @"An unknown error has occurred.";
      }
      break;
    case FIRStorageErrorCodeObjectNotFound:code = @"storage/object-not-found";
      message = @"No object exists at the desired reference.";
      break;
    case FIRStorageErrorCodeBucketNotFound:code = @"storage/bucket-not-found";
      message = @"No bucket is configured for Firebase Storage.";
      break;
    case FIRStorageErrorCodeProjectNotFound:code = @"storage/project-not-found";
      message = @"No project is configured for Firebase Storage.";
      break;
    case FIRStorageErrorCodeQuotaExceeded:code = @"storage/quota-exceeded";
      message = @"Quota on your Firebase Storage bucket has been exceeded.";
      break;
    case FIRStorageErrorCodeUnauthenticated:code = @"storage/unauthenticated";
      message = @"User is unauthenticated. Authenticate and try again.";
      break;
    case FIRStorageErrorCodeUnauthorized:code = @"storage/unauthorized";
      message = @"User is not authorized to perform the desired action.";
      break;
    case FIRStorageErrorCodeRetryLimitExceeded:code = @"storage/retry-limit-exceeded";
      message = @"The maximum time limit on an operation (upload, download, delete, etc.) has been exceeded.";
      break;
    case FIRStorageErrorCodeNonMatchingChecksum:code = @"storage/non-matching-checksum";
      message = @"File on the client does not match the checksum of the file received by the server.";
      break;
    case FIRStorageErrorCodeDownloadSizeExceeded:code = @"storage/download-size-exceeded";
      message = @"Size of the downloaded file exceeds the amount of memory allocated for the download.";
      break;
    case FIRStorageErrorCodeCancelled:code = @"storage/cancelled";
      message = @"User cancelled the operation.";
      break;
    default:break;
    }

    if (userInfo != nil && userInfo[@"data"]) {
      // errors with 'data' are unserializable - it breaks react so we send nil instead
      reject(code, message, nil);
    } else {
      reject(code, message, error);
    }
  }

  - (NSString *)getPathForDirectory:(int)directory {
    NSArray *paths = NSSearchPathForDirectoriesInDomains((NSSearchPathDirectory) directory, NSUserDomainMask, YES);
    return [paths firstObject];
  }

  - (NSDictionary *)constantsToExport {
    // TODO(salakar) clean me
    return @{@"MAIN_BUNDLE_PATH": [[NSBundle mainBundle] bundlePath],
        @"CACHES_DIRECTORY_PATH": [self getPathForDirectory:NSCachesDirectory],
        @"DOCUMENT_DIRECTORY_PATH": [self getPathForDirectory:NSDocumentDirectory],
        @"EXTERNAL_DIRECTORY_PATH": [NSNull null], @"EXTERNAL_STORAGE_DIRECTORY_PATH": [NSNull null],
        @"TEMP_DIRECTORY_PATH": NSTemporaryDirectory(),
        @"LIBRARY_DIRECTORY_PATH": [self getPathForDirectory:NSLibraryDirectory],
        @"FILETYPE_REGULAR": NSFileTypeRegular, @"FILETYPE_DIRECTORY": NSFileTypeDirectory};
  }

@end
