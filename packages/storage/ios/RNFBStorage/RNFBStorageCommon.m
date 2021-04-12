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
#import <Firebase/Firebase.h>

#import "RNFBStorageCommon.h"
#import "RNFBSharedUtils.h"
#import "RNFBUtilsModule.h"

@implementation RNFBStorageCommon

+ (NSData *)NSDataFromUploadString:(NSString *)string format:(NSString *)format {
  if ([format isEqualToString:@"base64"]) {
    return [[NSData alloc] initWithBase64EncodedString:string options:0];
  }

  // convert to base64
  if ([format isEqualToString:@"base64url"]) {
    NSString *base64Encoded = string;

    base64Encoded = [base64Encoded stringByReplacingOccurrencesOfString:@"-" withString:@"+"];
    base64Encoded = [base64Encoded stringByReplacingOccurrencesOfString:@"_" withString:@"/"];

    // add mandatory base64 encoding padding
    while (base64Encoded.length % 4 != 0) {
      base64Encoded = [base64Encoded stringByAppendingString:@"="];
    }

    return [[NSData alloc] initWithBase64EncodedString:base64Encoded options:0];
  }

  return nil;
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
  if (UTI) { CFRelease(UTI); }

  if (!mimeType) {
    return @"application/octet-stream";
  }

  return (__bridge_transfer NSString *) mimeType;
}

+ (void)NSURLForLocalFilePath:(NSString *)localFilePath completion:(void (^)(
    NSArray *errorCodeMessageArray,
    NSURL *temporaryFileUrl,
    NSString *contentType
))completion {
  if ([RNFBUtilsModule isRemoteAsset:localFilePath]) {
    PHAsset *asset = [RNFBUtilsModule fetchAssetForPath:localFilePath];
      
  if (!asset) {
    completion(@[@"asset-library-removed", @"iOS 'asset-library://' & 'ph://' URLs have been removed, please provide the correct path to resource."], nil, nil);
      
    return;
  }
    NSURL *temporaryFileUrl = [RNFBStorageCommon createTempFileUrl];
    [RNFBStorageCommon downloadAsset:asset toURL:temporaryFileUrl completion:^(
        NSArray *errorCodeMessageArray,
        NSString *contentType
    ) {
      completion(errorCodeMessageArray, temporaryFileUrl, contentType);
    }];
  } else {
    if (![[NSFileManager defaultManager] fileExistsAtPath:localFilePath]) {
      completion(@[@"file-not-found", @"The local file specified does not exist on the device."], nil, nil);
    } else {
      completion(nil, [NSURL fileURLWithPath:localFilePath], [RNFBStorageCommon mimeTypeForPath:localFilePath]);
    }
  }
}

+ (void)downloadAsset:(PHAsset *)asset toURL:(NSURL *)url completion:(void (^)(
    NSArray *errorCodeMessageArray,
    NSString *contentType
))completion {
  if (asset.mediaType == PHAssetMediaTypeImage && (asset.mediaSubtypes & PHAssetMediaSubtypePhotoLive)) {
    PHLivePhotoRequestOptions *options = [PHLivePhotoRequestOptions new];
    options.networkAccessAllowed = YES;
    [[PHImageManager defaultManager] requestLivePhotoForAsset:asset targetSize:CGSizeZero contentMode:PHImageContentModeAspectFill options:options resultHandler:^(
        PHLivePhoto *_Nullable livePhoto,
        NSDictionary *_Nullable info
    ) {
      if (info[PHImageErrorKey] != nil) {
        completion(@[@"ios-asset-failure", @"Live photo request failed."], nil);
        return;
      }

      NSData *livePhotoData = [NSKeyedArchiver archivedDataWithRootObject:livePhoto];
      if ([[NSFileManager defaultManager] createFileAtPath:url.path contents:livePhotoData attributes:nil]) {
        // TODO(salakar) figure out how to get the content type?
        completion(nil, nil);
      } else {
        completion(@[@"ios-asset-failure", @"Failed to create temporary live photo file."], nil);
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
      if (info[PHImageErrorKey] != nil) {
        completion(@[@"ios-asset-failure", @"Image request failed."], nil);
        return;
      }

      NSString *contentType = nil;
      NSData *finalData = nil;

      // TODO(salakar) handle ALL image types in UTCoreTypes, e.g. kUTTypeTIFF & kUTTypeBMP missing
      // TODO(salakar) so their original types are preserved to match Android behaviour
      if (
          UTTypeConformsTo((__bridge CFStringRef) dataUTI, kUTTypeJPEG) ||
              UTTypeConformsTo((__bridge CFStringRef) dataUTI, kUTTypePNG) ||
              UTTypeConformsTo((__bridge CFStringRef) dataUTI, kUTTypeGIF)
          ) {
        contentType = [self utiToMimeType:dataUTI];
        finalData = imageData;
      } else {
        // all other types are converted to JPEG, e.g. HEIC
        CGImageSourceRef source = CGImageSourceCreateWithData((__bridge CFDataRef) imageData, NULL);
        NSDictionary *imageInfo = (__bridge NSDictionary *) CGImageSourceCopyPropertiesAtIndex(source, 0, NULL);
        NSDictionary *imageMetadata = [imageInfo copy];
        NSMutableData *imageDataJPEG = [NSMutableData data];
        CGImageDestinationRef destination =
            CGImageDestinationCreateWithData((__bridge CFMutableDataRef) imageDataJPEG, kUTTypeJPEG, 1, NULL);
        CGImageDestinationAddImageFromSource(destination, source, 0, (__bridge CFDictionaryRef) imageMetadata);
        CGImageDestinationFinalize(destination);
        contentType = @"image/jpeg";
        finalData = imageDataJPEG;
      }

      if ([[NSFileManager defaultManager] createFileAtPath:url.path contents:finalData attributes:nil]) {
        completion(nil, contentType);
      } else {
        completion(@[@"ios-asset-failure", @"Failed to create image file."], nil);
      }
    }];
  } else if (asset.mediaType == PHAssetMediaTypeVideo) {
    PHVideoRequestOptions *options = [PHVideoRequestOptions new];
    options.networkAccessAllowed = YES;
    [[PHImageManager defaultManager] requestExportSessionForVideo:asset options:options exportPreset:AVAssetExportPresetMediumQuality resultHandler:^(
        AVAssetExportSession *_Nullable exportSession,
        NSDictionary *_Nullable info
    ) {
      if (info[PHImageErrorKey] != nil) {
        completion(@[@"ios-asset-failure", @"Video export request failed."], nil);
        return;
      }

      exportSession.outputURL = url;

      NSArray<PHAssetResource *> *resources = [PHAssetResource assetResourcesForAsset:asset];
      for (PHAssetResource *resource in resources) {
        if (resources.count > 1) {
          if (resource.type != PHAssetResourceTypeVideo) {
            continue;
          } else {
            exportSession.outputFileType = resource.uniformTypeIdentifier;
          }
        } else {
          exportSession.outputFileType = resource.uniformTypeIdentifier;
        }

        if (exportSession.outputFileType != nil) break;
      }

      [exportSession exportAsynchronouslyWithCompletionHandler:^{
        if (exportSession.status == AVAssetExportSessionStatusCompleted) {
          completion(nil, [self utiToMimeType:exportSession.outputFileType]);
        } else {
          completion(@[@"ios-asset-failure", @"Video export request session failed."], nil);
        }
      }];
    }];
  } else {
    completion(@[@"ios-asset-failure", @"Unknown or unsupported asset media type."], nil);
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
      @"code": (NSString *) codeAndMessage[0],
      @"message": (NSString *) codeAndMessage[1],
      @"nativeErrorMessage": [error localizedDescription]
  };
  return taskSnapshotDict;
}

+ (NSDictionary *)buildErrorSnapshotDictFromCodeAndMessage:(NSArray *)codeAndMessage taskSnapshotDict:(NSMutableDictionary *)taskSnapshotDict {
  taskSnapshotDict[@"error"] = @{
      @"code": (NSString *) codeAndMessage[0],
      @"message": (NSString *) codeAndMessage[1],
  };
  return taskSnapshotDict;
}

+ (NSDictionary *)metadataToDict:(FIRStorageMetadata *)metadata {
  NSMutableDictionary *storageMetadata = [[metadata dictionaryRepresentation] mutableCopy];
  if (storageMetadata == nil) {
    return nil;
  }

  storageMetadata[@"fullPath"] = metadata.path;

  if (metadata.cacheControl == nil) {
    storageMetadata[@"cacheControl"] = [NSNull null];
  }

  if (metadata.contentLanguage == nil) {
    storageMetadata[@"contentLanguage"] = [NSNull null];
  }

  if (metadata.contentEncoding == nil) {
    storageMetadata[@"contentEncoding"] = [NSNull null];
  }

  if (metadata.contentDisposition == nil) {
    storageMetadata[@"contentDisposition"] = [NSNull null];
  }

  if (metadata.contentType == nil) {
    storageMetadata[@"contentType"] = [NSNull null];
  }

  if (metadata.md5Hash == nil) {
    storageMetadata[@"md5Hash"] = [NSNull null];
  }

  if (metadata.customMetadata == nil) {
    storageMetadata[@"customMetadata"] = [NSNull null];
  } else {
    // name comes through as 'metadata'
    storageMetadata[@"customMetadata"] = metadata.customMetadata;
    [storageMetadata removeObjectForKey:@"metadata"];
  }

  return storageMetadata;
}

+ (NSDictionary *)listResultToDict:(FIRStorageListResult *)listResult {
  NSMutableArray *items = [[NSMutableArray alloc]init];
  NSMutableArray *prefixes = [[NSMutableArray alloc]init];

  for (FIRStorageReference *ref in listResult.items) {
    [items addObject:[ref fullPath]];
  }

  for (FIRStorageReference *ref in listResult.prefixes) {
    [prefixes addObject:[ref fullPath]];
  }

  return @{
    @"nextPageToken": [listResult pageToken] != nil ? (id) [listResult pageToken] : [NSNull null],
    @"items": items,
    @"prefixes": prefixes,
  };
}

+ (NSMutableDictionary *)getUploadTaskAsDictionary:(FIRStorageTaskSnapshot *)task {
  if (task == nil) {
    return [@{
        @"metadata": [NSNull null],
        @"bytesTransferred": @(0),
        @"state": @"error",
        @"totalBytes": @(0)
    } mutableCopy];
  }

  NSDictionary *storageMetadata = [self metadataToDict:task.metadata];

  NSString* state = [self getTaskStatus:task.status];
  if (task.error != nil && task.error.code == FIRStorageErrorCodeCancelled) {
    state = @"cancelled";
  }

  return [@{
      @"bytesTransferred": @(task.progress.completedUnitCount),
      @"metadata": storageMetadata != nil ? storageMetadata : [NSNull null],
      @"state": state,
      @"totalBytes": @(task.progress.totalUnitCount)
  } mutableCopy];
}

+ (NSMutableDictionary *)getDownloadTaskAsDictionary:(FIRStorageTaskSnapshot *)task {
  if (task != nil) {
    NSString* state = [self getTaskStatus:task.status];
    if (task.error != nil && task.error.code == FIRStorageErrorCodeCancelled) {
      state = @"cancelled";
    }
    return [@{
        @"bytesTransferred": @(task.progress.completedUnitCount),
        @"state": state,
        @"totalBytes": @(task.progress.totalUnitCount)
    } mutableCopy];
  } else {
    return [@{
        @"bytesTransferred": @(0),
        @"state": [self getTaskStatus:nil],
        @"totalBytes": @(0)
    } mutableCopy];
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
  FIRStorageMetadata *storageMetadata = [[FIRStorageMetadata alloc] initWithDictionary:metadata];
  storageMetadata.customMetadata = [metadata[@"customMetadata"] mutableCopy];
  return storageMetadata;
}

+ (NSArray *)getErrorCodeMessage:(NSError *)error {
  NSString *code = @"unknown";

  if (error == nil) {
    return @[code, @"An unknown error has occurred."];
  }

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
