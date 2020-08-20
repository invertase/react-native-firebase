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
#import <Photos/Photos.h>

@interface RNFBStorageCommon : NSObject

+ (BOOL)isRemoteAsset:(NSString *)localFilePath;

+ (BOOL)unused_isHeic:(NSString *)localFilePath;

+ (NSDictionary *)metadataToDict:(FIRStorageMetadata *)metadata;

+ (NSDictionary *)listResultToDict:(FIRStorageListResult *)listResult;

+ (PHAsset *)fetchAssetForPath:(NSString *)localFilePath;

+ (NSString *)utiToMimeType:(NSString *)dataUTI;

+ (NSURL *)createTempFileUrl;

+ (NSString *)mimeTypeForPath:(NSString *)localFilePath;

+ (NSData *)NSDataFromUploadString:(NSString *)string format:(NSString *)format;

+ (void)NSURLForLocalFilePath:(NSString *)localFilePath completion:(void (^)(
    NSArray *errorCodeMessageArray,
    NSURL *temporaryFileUrl,
    NSString *contentType
))completion;

+ (void)downloadAsset:(PHAsset *)asset toURL:(NSURL *)url completion:(void (^)(
    NSArray *errorCodeMessageArray,
    NSString *contentType
))completion;

+ (NSDictionary *)getStorageEventDictionary:(NSDictionary *)eventBody internalEventName:(NSString *)internalEventName appName:(NSString *)appName taskId:(NSNumber *)taskId;

+ (NSDictionary *)buildErrorSnapshotDict:(NSError *)error taskSnapshotDict:(NSMutableDictionary *)taskSnapshotDict;

+ (NSDictionary *)buildErrorSnapshotDictFromCodeAndMessage:(NSArray *)codeAndMessage taskSnapshotDict:(NSMutableDictionary *)taskSnapshotDict;

+ (NSMutableDictionary *)getUploadTaskAsDictionary:(FIRStorageTaskSnapshot *)task;

+ (NSMutableDictionary *)getDownloadTaskAsDictionary:(FIRStorageTaskSnapshot *)task;

+ (NSString *)getTaskStatus:(FIRStorageTaskStatus)status;

+ (FIRStorageMetadata *)buildMetadataFromMap:(NSDictionary *)metadata;

+ (NSArray *)getErrorCodeMessage:(NSError *)error;

@end

