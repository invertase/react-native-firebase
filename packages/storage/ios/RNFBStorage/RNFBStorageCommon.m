//
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

#import <MobileCoreServices/MobileCoreServices.h>
#import <Photos/Photos.h>
#import <Firebase/Firebase.h>

#import "RNFBStorageCommon.h"
#import "RNFBSharedUtils.h"

@implementation RNFBStorageCommon

+ (BOOL)isRemoteAsset:(NSString *)localFilePath {
  return [localFilePath hasPrefix:@"assets-library://"] || [localFilePath hasPrefix:@"ph://"];
}

+ (BOOL)isHeic:(NSString *)localFilePath {
  return [[localFilePath pathExtension] caseInsensitiveCompare:@"heic"] == NSOrderedSame;
}

+ (PHAsset *)fetchAssetForPath:(NSString *)localFilePath {
  PHAsset *asset;
  if ([localFilePath hasPrefix:@"assets-library://"]) {
    NSURL *localFile = [[NSURL alloc] initWithString:localFilePath];
    asset = [[PHAsset fetchAssetsWithALAssetURLs:@[localFile] options:nil] firstObject];
  } else {
    NSString *assetId = [localFilePath substringFromIndex:@"ph://".length];
    asset = [[PHAsset fetchAssetsWithLocalIdentifiers:@[assetId] options:nil] firstObject];
  }
  return asset;
}

+ (NSString *)utiToMimeType:(NSString *)dataUTI {
  return (__bridge_transfer NSString *) UTTypeCopyPreferredTagWithClass((__bridge CFStringRef) dataUTI,
      kUTTagClassMIMEType);
}

+ (NSURL *)createTempFileUrl {
  NSString *filename = [NSString stringWithFormat:@"%@.tmp", [[NSProcessInfo processInfo] globallyUniqueString]];
  return [[NSURL fileURLWithPath:NSTemporaryDirectory()] URLByAppendingPathComponent:filename];
}

+ (NSString *)mimeTypeForPath:(NSString *)localFilePath {
  CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension,
      (__bridge CFStringRef) [localFilePath pathExtension],
      NULL);
  CFStringRef mimeType = UTTypeCopyPreferredTagWithClass(UTI, kUTTagClassMIMEType);
  CFRelease(UTI);

  if (!mimeType) {
    return @"application/octet-stream";
  }

  return (__bridge_transfer NSString *) mimeType;
}

+ (void)downloadAsset:(PHAsset *)asset toURL:(NSURL *)url completion:(void (^)(NSError *downloadError))completion {
  if (asset.mediaType == PHAssetMediaTypeImage && (asset.mediaSubtypes & PHAssetMediaSubtypePhotoLive)) {
    PHLivePhotoRequestOptions *options = [PHLivePhotoRequestOptions new];
    options.networkAccessAllowed = YES;
    [[PHImageManager defaultManager] requestLivePhotoForAsset:asset targetSize:CGSizeZero contentMode:PHImageContentModeAspectFill options:options resultHandler:^(
        PHLivePhoto *_Nullable livePhoto,
        NSDictionary *_Nullable info
    ) {
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
    [[PHImageManager defaultManager] requestImageDataForAsset:asset options:options resultHandler:^(
        NSData *_Nullable imageData,
        NSString *_Nullable dataUTI,
        UIImageOrientation orientation,
        NSDictionary *_Nullable info
    ) {
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
        NSDictionary *_Nullable info
    ) {
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

+ (NSDictionary *)getStorageEventDictionary:(NSDictionary *)eventBody internalEventName:(NSString *)internalEventName appName:(NSString *)appName taskId:(NSNumber *)taskId {
  return @{
      @"taskId": @([taskId doubleValue]),
      @"body": eventBody,
      @"appName": [RNFBSharedUtils getAppJavaScriptName:appName],
      @"eventName": internalEventName,
  };
}

+ (NSDictionary *)buildErrorSnapshotDict:(NSError *)error taskSnapshotDict:(NSMutableDictionary *)taskSnapshotDict {
  NSArray *codeAndMessage = [self getErrorCodeMessage:error];
  taskSnapshotDict[@"error"] = @{
      @"code": codeAndMessage[0],
      @"message": codeAndMessage[1],
      @"nativeErrorMessage": [error localizedDescription]
  };
  taskSnapshotDict[@"state"] = @"error";
  return taskSnapshotDict;
}

+ (NSMutableDictionary *)getUploadTaskAsDictionary:(FIRStorageTaskSnapshot *)task {
  NSDictionary *storageMetadata = [task.metadata dictionaryRepresentation];

  return (NSMutableDictionary *) @{
      @"bytesTransferred": @(task.progress.completedUnitCount),
      @"metadata": storageMetadata != nil ? storageMetadata : [NSNull null],
      @"state": [self getTaskStatus:task.status],
      @"totalBytes": @(task.progress.totalUnitCount)
  };
}

+ (NSMutableDictionary *)getDownloadTaskAsDictionary:(FIRStorageTaskSnapshot *)task {
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

+ (NSString *)getTaskStatus:(FIRStorageTaskStatus)status {
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

+ (FIRStorageMetadata *)buildMetadataFromMap:(NSDictionary *)metadata {
  // TODO(salakar): update to use specific getters/setters rather than blanket initing with a dictionary
  // TODO(salakar): to fix conversion issues with timeCreated & updated, generation & metageneration
  FIRStorageMetadata *storageMetadata = [[FIRStorageMetadata alloc] initWithDictionary:metadata];
  storageMetadata.customMetadata = [metadata[@"customMetadata"] mutableCopy];
  return storageMetadata;
}

+ (NSArray *)getErrorCodeMessage:(NSError *)error {
  NSString *code = @"unknown";
  NSString *message = [error localizedDescription];

  NSDictionary *userInfo = [error userInfo];
  NSError *underlyingError = userInfo[NSUnderlyingErrorKey];
  NSString *underlyingErrorDescription = [underlyingError localizedDescription];

  switch (error.code) {
  case FIRStorageErrorCodeUnknown:
    if ([underlyingErrorDescription isEqualToString:@"The operation couldn’t be completed. Permission denied"]) {
      code = @"invalid-device-file-path";
      message = @"The specified device file path is invalid or is restricted.";
    } else {
      message = @"An unknown error has occurred.";
    }
    break;
  case FIRStorageErrorCodeObjectNotFound:code = @"object-not-found";
    message = @"No object exists at the desired reference.";
    break;
  case FIRStorageErrorCodeBucketNotFound:code = @"bucket-not-found";
    message = @"No bucket is configured for Firebase Storage.";
    break;
  case FIRStorageErrorCodeProjectNotFound:code = @"project-not-found";
    message = @"No project is configured for Firebase Storage.";
    break;
  case FIRStorageErrorCodeQuotaExceeded:code = @"quota-exceeded";
    message = @"Quota on your Firebase Storage bucket has been exceeded.";
    break;
  case FIRStorageErrorCodeUnauthenticated:code = @"unauthenticated";
    message = @"User is unauthenticated. Authenticate and try again.";
    break;
  case FIRStorageErrorCodeUnauthorized:code = @"unauthorized";
    message = @"User is not authorized to perform the desired action.";
    break;
  case FIRStorageErrorCodeRetryLimitExceeded:code = @"retry-limit-exceeded";
    message = @"The maximum time limit on an operation (upload, download, delete, etc.) has been exceeded.";
    break;
  case FIRStorageErrorCodeNonMatchingChecksum:code = @"non-matching-checksum";
    message = @"File on the client does not match the checksum of the file received by the server.";
    break;
  case FIRStorageErrorCodeDownloadSizeExceeded:code = @"download-size-exceeded";
    message = @"Size of the downloaded file exceeds the amount of memory allocated for the download.";
    break;
  case FIRStorageErrorCodeCancelled:code = @"cancelled";
    message = @"User cancelled the operation.";
    break;
  default:break;
  }

  return @[code, message];
}

@end