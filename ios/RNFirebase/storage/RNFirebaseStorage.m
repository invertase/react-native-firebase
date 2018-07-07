#import "RNFirebaseStorage.h"

#if __has_include(<FirebaseStorage/FIRStorage.h>)

#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"
#import <MobileCoreServices/MobileCoreServices.h>
#import <Photos/Photos.h>
#import <Firebase.h>
#import <React/RCTUtils.h>

@implementation RNFirebaseStorage

RCT_EXPORT_MODULE(RNFirebaseStorage);

// Run on a different thread
- (dispatch_queue_t)methodQueue {
    return dispatch_queue_create("io.invertase.react-native-firebase.storage", DISPATCH_QUEUE_SERIAL);
}

/**
 delete

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
 @param NSString path
 */
RCT_EXPORT_METHOD(delete:(NSString *) appDisplayName
                    path:(NSString *) path
                resolver:(RCTPromiseResolveBlock) resolve
                rejecter:(RCTPromiseRejectBlock) reject) {
    FIRStorageReference *fileRef = [self getReference:path appDisplayName:appDisplayName];

    [fileRef deleteWithCompletion:^(NSError *_Nullable error) {
        if (error != nil) {
            [self promiseRejectStorageException:reject error:error];
        } else {
            resolve([NSNull null]);
        }
    }];
}

/**
 getDownloadURL

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
 @param NSString path
 */
RCT_EXPORT_METHOD(getDownloadURL:(NSString *) appDisplayName
                            path:(NSString *) path
                        resolver:(RCTPromiseResolveBlock) resolve
                        rejecter:(RCTPromiseRejectBlock) reject) {
    FIRStorageReference *fileRef = [self getReference:path appDisplayName:appDisplayName];

    [fileRef downloadURLWithCompletion:^(NSURL *_Nullable URL, NSError *_Nullable error) {
        if (error != nil) {
            [self promiseRejectStorageException:reject error:error];
        } else {
            resolve([URL absoluteString]);
        }
    }];
}

/**
 getMetadata

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
 @param NSString path
 */
RCT_EXPORT_METHOD(getMetadata:(NSString *) appDisplayName
                         path:(NSString *) path
                     resolver:(RCTPromiseResolveBlock) resolve
                     rejecter:(RCTPromiseRejectBlock) reject) {
    FIRStorageReference *fileRef = [self getReference:path appDisplayName:appDisplayName];

    [fileRef metadataWithCompletion:^(FIRStorageMetadata *_Nullable metadata, NSError *_Nullable error) {
        if (error != nil) {
            [self promiseRejectStorageException:reject error:error];
        } else {
            resolve([metadata dictionaryRepresentation]);
        }
    }];
}

/**
 updateMetadata

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
 @param NSString path
 @param NSDictionary metadata
 */
RCT_EXPORT_METHOD(updateMetadata:(NSString *) appDisplayName
                            path:(NSString *) path
                        metadata:(NSDictionary *) metadata
                        resolver:(RCTPromiseResolveBlock) resolve
                        rejecter:(RCTPromiseRejectBlock) reject) {
    FIRStorageReference *fileRef = [self getReference:path appDisplayName:appDisplayName];
    FIRStorageMetadata *firmetadata = [self buildMetadataFromMap:metadata];

    [fileRef updateMetadata:firmetadata completion:^(FIRStorageMetadata *_Nullable metadata, NSError *_Nullable error) {
        if (error != nil) {
            [self promiseRejectStorageException:reject error:error];
        } else {
            resolve([metadata dictionaryRepresentation]);
        }
    }];
}

/**
 downloadFile

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#downloadFile
 @param NSString path
 @param NSString localPath
 */
RCT_EXPORT_METHOD(downloadFile:(NSString *) appDisplayName
                          path:(NSString *) path
                     localPath:(NSString *) localPath
                      resolver:(RCTPromiseResolveBlock) resolve
                      rejecter:(RCTPromiseRejectBlock) reject) {
    FIRStorageReference *fileRef = [self getReference:path appDisplayName:appDisplayName];
    NSURL *localFile = [NSURL fileURLWithPath:localPath];
    
    __block FIRStorageDownloadTask *downloadTask;
    RCTUnsafeExecuteOnMainQueueSync(^{
        downloadTask = [fileRef writeToFile:localFile];
    });

    // listen for state changes, errors, and completion of the download.
    [downloadTask observeStatus:FIRStorageTaskStatusResume handler:^(FIRStorageTaskSnapshot *snapshot) {
        // download resumed, also fires when the upload starts
        NSDictionary *event = [self getDownloadTaskAsDictionary:snapshot];
        [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_STATE_CHANGED props:event];
    }];

    [downloadTask observeStatus:FIRStorageTaskStatusPause handler:^(FIRStorageTaskSnapshot *snapshot) {
        // download paused
        NSDictionary *event = [self getDownloadTaskAsDictionary:snapshot];
        [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_STATE_CHANGED props:event];
    }];

    [downloadTask observeStatus:FIRStorageTaskStatusProgress handler:^(FIRStorageTaskSnapshot *snapshot) {
        // download reported progress
        NSDictionary *event = [self getDownloadTaskAsDictionary:snapshot];
        [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_STATE_CHANGED props:event];
    }];

    [downloadTask observeStatus:FIRStorageTaskStatusSuccess handler:^(FIRStorageTaskSnapshot *snapshot) {
        // download completed successfully
        NSDictionary *resp = [self getDownloadTaskAsDictionary:snapshot];
        [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_DOWNLOAD_SUCCESS props:resp];
        resolve(resp);
    }];

    [downloadTask observeStatus:FIRStorageTaskStatusFailure handler:^(FIRStorageTaskSnapshot *snapshot) {
        // download task failed
        // TODO sendJSError event
        if (snapshot.error != nil) {
            [self promiseRejectStorageException:reject error:snapshot.error];
        }
    }];
}

/**
 setMaxDownloadRetryTime

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
 @param NSNumber milliseconds
 */
RCT_EXPORT_METHOD(setMaxDownloadRetryTime:(NSString *) appDisplayName
                             milliseconds:(nonnull NSNumber *) milliseconds) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    [[FIRStorage storageForApp:firApp] setMaxDownloadRetryTime:[milliseconds doubleValue]];
}

/**
 setMaxOperationRetryTime

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
 @param NSNumber milliseconds
 */
RCT_EXPORT_METHOD(setMaxOperationRetryTime:(NSString *) appDisplayName
                              milliseconds:(nonnull NSNumber *) milliseconds) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    [[FIRStorage storageForApp:firApp] setMaxOperationRetryTime:[milliseconds doubleValue]];
}

/**
 setMaxUploadRetryTime

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
 */
RCT_EXPORT_METHOD(setMaxUploadRetryTime:(NSString *) appDisplayName
                           milliseconds:(nonnull NSNumber *) milliseconds) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    [[FIRStorage storageForApp:firApp] setMaxUploadRetryTime:[milliseconds doubleValue]];
}

/**
 putFile

 @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putFile
 @param NSString path
 @param NSString localPath
 @param NSDictionary metadata
 */
RCT_EXPORT_METHOD(putFile:(NSString *) appDisplayName
                     path:(NSString *) path
                localPath:(NSString *) localPath
                 metadata:(NSDictionary *) metadata
                 resolver:(RCTPromiseResolveBlock) resolve
                 rejecter:(RCTPromiseRejectBlock) reject) {
    if (![[NSFileManager defaultManager] fileExistsAtPath:localPath]) {
        reject(@"storage/file-not-found", @"File specified at path does not exist.", nil);
        return;
    }
    
    NSData *data = [NSData dataWithContentsOfFile:localPath];
    FIRStorageMetadata *firmetadata = [self buildMetadataFromMap:metadata];
    
    if ([firmetadata valueForKey:@"contentType"] == nil) {
        firmetadata.contentType = [self mimeTypeForPath:localPath];
    }
    
    // TODO convert heic -> jpeg only if users asks for it
    
    [self uploadData:appDisplayName data:data firmetadata:firmetadata path:path resolver:resolve rejecter:reject];
}

- (NSString*) mimeTypeForPath: (NSString *) path {
    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (__bridge CFStringRef)[path pathExtension], NULL);
    CFStringRef mimeType = UTTypeCopyPreferredTagWithClass (UTI, kUTTagClassMIMEType);
    CFRelease(UTI);
    
    if (!mimeType) {
        return @"application/octet-stream";
    }
    
    return (__bridge_transfer NSString *) mimeType;
}

- (void)uploadFile:(NSString *)appDisplayName url:(NSURL *)url firmetadata:(FIRStorageMetadata *)firmetadata path:(NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
    FIRStorageReference *fileRef = [self getReference:path appDisplayName:appDisplayName];
    __block FIRStorageUploadTask *uploadTask;
    RCTUnsafeExecuteOnMainQueueSync(^{
        uploadTask = [fileRef putFile:url metadata:firmetadata];
    });
    [self addUploadObservers:appDisplayName uploadTask:uploadTask path:path resolver:resolve rejecter:reject];
}

- (void)uploadData:(NSString *)appDisplayName data:(NSData *)data firmetadata:(FIRStorageMetadata *)firmetadata path:(NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
    FIRStorageReference *fileRef = [self getReference:path appDisplayName:appDisplayName];
    __block FIRStorageUploadTask *uploadTask;
    RCTUnsafeExecuteOnMainQueueSync(^{
        uploadTask = [fileRef putData:data metadata:firmetadata];
    });
    [self addUploadObservers:appDisplayName uploadTask:uploadTask path:path resolver:resolve rejecter:reject];
}

- (void)addUploadObservers:(NSString *)appDisplayName uploadTask:(FIRStorageUploadTask *)uploadTask path:(NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
    // listen for state changes, errors, and completion of the upload.
    [uploadTask observeStatus:FIRStorageTaskStatusResume handler:^(FIRStorageTaskSnapshot *snapshot) {
        // upload resumed, also fires when the upload starts
        [self getUploadTaskAsDictionary:snapshot handler:^(NSDictionary *event) {
            [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_STATE_CHANGED props:event];
        }];
    }];

    [uploadTask observeStatus:FIRStorageTaskStatusPause handler:^(FIRStorageTaskSnapshot *snapshot) {
        // upload paused
        [self getUploadTaskAsDictionary:snapshot handler:^(NSDictionary *event) {
            [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_STATE_CHANGED props:event];
        }];
    }];
    [uploadTask observeStatus:FIRStorageTaskStatusProgress handler:^(FIRStorageTaskSnapshot *snapshot) {
        // upload reported progress
        [self getUploadTaskAsDictionary:snapshot handler:^(NSDictionary *event) {
            [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_STATE_CHANGED props:event];
        }];
    }];

    [uploadTask observeStatus:FIRStorageTaskStatusSuccess handler:^(FIRStorageTaskSnapshot *snapshot) {
        // upload completed successfully
        [self getUploadTaskAsDictionary:snapshot handler:^(NSDictionary *event) {
            [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_STATE_CHANGED props:event];
            [self sendJSEvent:appDisplayName type:STORAGE_EVENT path:path title:STORAGE_UPLOAD_SUCCESS props:event];
            resolve(event);
        }];
    }];

    [uploadTask observeStatus:FIRStorageTaskStatusFailure handler:^(FIRStorageTaskSnapshot *snapshot) {
        if (snapshot.error != nil) {
            [self promiseRejectStorageException:reject error:snapshot.error];
        }
    }];
}

- (FIRStorageReference *)getReference:(NSString *)path
                       appDisplayName:(NSString *)appDisplayName {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    if ([path hasPrefix:@"url::"]) {
        NSString *url = [path substringFromIndex:5];
        return [[FIRStorage storageForApp:firApp] referenceForURL:url];
    } else {
        return [[FIRStorage storageForApp:firApp] referenceWithPath:path];
    }
}

- (NSDictionary *)getDownloadTaskAsDictionary:(FIRStorageTaskSnapshot *)task {
    return @{@"bytesTransferred": @(task.progress.completedUnitCount), @"ref": task.reference.fullPath, @"state": [self getTaskStatus:task.status], @"totalBytes": @(task.progress.totalUnitCount)};
}

- (void)getUploadTaskAsDictionary:(FIRStorageTaskSnapshot *)task
                          handler:(void(^)(NSDictionary *))handler {
    [[task reference] downloadURLWithCompletion:^(NSURL * _Nullable URL, NSError * _Nullable error) {
        NSString *downloadUrl = [URL absoluteString];
        NSDictionary *metadata = [task.metadata dictionaryRepresentation];
        NSDictionary *dictionary = @{@"bytesTransferred": @(task.progress.completedUnitCount), @"downloadURL": downloadUrl != nil ? downloadUrl : [NSNull null], @"metadata": metadata != nil ? metadata : [NSNull null], @"ref": task.reference.fullPath, @"state": [self getTaskStatus:task.status], @"totalBytes": @(task.progress.totalUnitCount)};
        handler(dictionary);
    }];
}

- (FIRStorageMetadata *)buildMetadataFromMap:(NSDictionary *)metadata {
    FIRStorageMetadata *storageMetadata = [[FIRStorageMetadata alloc] initWithDictionary:metadata];
    storageMetadata.customMetadata = [metadata[@"customMetadata"] mutableCopy];
    return storageMetadata;
}

- (NSString *)getTaskStatus:(FIRStorageTaskStatus)status {
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

- (NSString *)getPathForDirectory:(int)directory {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask, YES);
    return [paths firstObject];
}

- (NSDictionary *)constantsToExport {
    return @{@"MAIN_BUNDLE_PATH": [[NSBundle mainBundle] bundlePath], @"CACHES_DIRECTORY_PATH": [self getPathForDirectory:NSCachesDirectory], @"DOCUMENT_DIRECTORY_PATH": [self getPathForDirectory:NSDocumentDirectory], @"EXTERNAL_DIRECTORY_PATH": [NSNull null], @"EXTERNAL_STORAGE_DIRECTORY_PATH": [NSNull null], @"TEMP_DIRECTORY_PATH": NSTemporaryDirectory(), @"LIBRARY_DIRECTORY_PATH": [self getPathForDirectory:NSLibraryDirectory], @"FILETYPE_REGULAR": NSFileTypeRegular, @"FILETYPE_DIRECTORY": NSFileTypeDirectory};
}

- (NSArray<NSString *> *)supportedEvents {
    return @[STORAGE_EVENT, STORAGE_ERROR];
}

- (void)sendJSError:(NSString *)appDisplayName error:(NSError *)error path:(NSString *)path {
    NSDictionary *evt = @{@"path": path, @"message": [error debugDescription]};
    [self sendJSEvent:appDisplayName type:STORAGE_ERROR path:path title:STORAGE_ERROR props:evt];
}

- (void)sendJSEvent:(NSString *)appDisplayName type:(NSString *)type path:(NSString *)path title:(NSString *)title props:(NSDictionary *)props {
    [RNFirebaseUtil sendJSEvent:self name:type body:@{@"eventName": title, @"appName": appDisplayName, @"path": path, @"body": props}];
}

/**
 Reject a promise with a storage exception

 @param reject RCTPromiseRejectBlock
 @param error NSError
 */
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
        case FIRStorageErrorCodeObjectNotFound:
            code = @"storage/object-not-found";
            message = @"No object exists at the desired reference.";
            break;
        case FIRStorageErrorCodeBucketNotFound:
            code = @"storage/bucket-not-found";
            message = @"No bucket is configured for Firebase Storage.";
            break;
        case FIRStorageErrorCodeProjectNotFound:
            code = @"storage/project-not-found";
            message = @"No project is configured for Firebase Storage.";
            break;
        case FIRStorageErrorCodeQuotaExceeded:
            code = @"storage/quota-exceeded";
            message = @"Quota on your Firebase Storage bucket has been exceeded.";
            break;
        case FIRStorageErrorCodeUnauthenticated:
            code = @"storage/unauthenticated";
            message = @"User is unauthenticated. Authenticate and try again.";
            break;
        case FIRStorageErrorCodeUnauthorized:
            code = @"storage/unauthorized";
            message = @"User is not authorized to perform the desired action.";
            break;
        case FIRStorageErrorCodeRetryLimitExceeded:
            code = @"storage/retry-limit-exceeded";
            message = @"The maximum time limit on an operation (upload, download, delete, etc.) has been exceeded.";
            break;
        case FIRStorageErrorCodeNonMatchingChecksum:
            code = @"storage/non-matching-checksum";
            message = @"File on the client does not match the checksum of the file received by the server.";
            break;
        case FIRStorageErrorCodeDownloadSizeExceeded:
            code = @"storage/download-size-exceeded";
            message = @"Size of the downloaded file exceeds the amount of memory allocated for the download.";
            break;
        case FIRStorageErrorCodeCancelled:
            code = @"storage/cancelled";
            message = @"User cancelled the operation.";
            break;
        default:
            break;
    }

    if (userInfo != nil && userInfo[@"data"]) {
        // errors with 'data' are unserializable - it breaks react so we send nil instead
        reject(code, message, nil);
    } else {
        reject(code, message, error);
    }
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation RNFirebaseStorage
@end
#endif
