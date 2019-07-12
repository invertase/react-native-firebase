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

#import "RNFBFirestoreCommon.h"
#import "RNFBSharedUtils.h"

@implementation RNFBFirestoreCommon

+ (FIRFirestore *)getFirestoreForApp
    :(FIRApp *)app {
  return [FIRFirestore firestoreForApp:app];
}

+ (FIRDocumentReference *)getDocumentForFirestore
    :(FIRFirestore *)firestore
                                             path:(NSString *)path {
  return [firestore documentWithPath:path];
}

+ (FIRQuery *)getQueryForFirestore
    :(FIRFirestore *)firestore
                              path:(NSString *)path
                              type:(NSString *)type {
  if ([type isEqualToString:@"collectionGroup"]) {
    return [firestore collectionGroupWithID:path];
  }

  return [firestore collectionWithPath:path];
}

+ (void)promiseRejectFirestoreException
    :(RCTPromiseRejectBlock)reject
                                  error:(NSError *)error {
  NSArray *codeAndMessage = [self getCodeAndMessage:error];
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
      @"code": (NSString *) codeAndMessage[0],
      @"message": (NSString *) codeAndMessage[1],
  }];
}

+ (NSArray *)getCodeAndMessage:(NSError *)error {
  NSString *code = @"unknown";

  if (error == nil) {
    return @[code, @"An unknown error has occurred."];
  }

  NSString *message;

  switch (error.code) {
    case FIRFirestoreErrorCodeAborted:
      code = @"aborted";
      message = @"The operation was aborted, typically due to a concurrency issue like transaction aborts, etc.";
      break;
    case FIRFirestoreErrorCodeAlreadyExists:
      code = @"already-exists";
      message = @"Some document that we attempted to create already exists.";
      break;
    case FIRFirestoreErrorCodeCancelled:
      code = @"cancelled";
      message = @"The operation was cancelled (typically by the caller).";
      break;
    case FIRFirestoreErrorCodeDataLoss:
      code = @"data-loss";
      message = @"Unrecoverable data loss or corruption.";
      break;
    case FIRFirestoreErrorCodeDeadlineExceeded:
      code = @"deadline-exceeded";
      message = @"Deadline expired before operation could complete. For operations that change the state of the system, this error may be returned even if the operation has completed successfully. For example, a successful response from a server could have been delayed long enough for the deadline to expire.";
      break;
    case FIRFirestoreErrorCodeFailedPrecondition:
      code = @"failed-precondition";
      message = @"Operation was rejected because the system is not in a state required for the operation's execution. Ensure your query has been indexed via the Firebase console.";
      break;
    case FIRFirestoreErrorCodeInternal:
      code = @"internal";
      message = @"Internal errors. Means some invariants expected by underlying system has been broken. If you see one of these errors, something is very broken.";
      break;
    case FIRFirestoreErrorCodeInvalidArgument:
      code = @"invalid-argument";
      message = @"Client specified an invalid argument. Note that this differs from failed-precondition. invalid-argument indicates arguments that are problematic regardless of the state of the system (e.g., an invalid field name).";
      break;
    case FIRFirestoreErrorCodeNotFound:
      code = @"not-found";
      message = @"Some requested document was not found.";
      break;
    case FIRFirestoreErrorCodeOutOfRange:
      code = @"out-of-range";
      message = @"Operation was attempted past the valid range.";
      break;
    case FIRFirestoreErrorCodePermissionDenied:
      code = @"permission-denied";
      message = @"The caller does not have permission to execute the specified operation.";
      break;
    case FIRFirestoreErrorCodeResourceExhausted:
      code = @"resource-exhausted";
      message = @"Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.";
      break;
    case FIRFirestoreErrorCodeUnauthenticated:
      code = @"unauthenticated";
      message = @"The request does not have valid authentication credentials for the operation.";
      break;
    case FIRFirestoreErrorCodeUnavailable:
      code = @"unavailable";
      message = @"The service is currently unavailable. This is a most likely a transient condition and may be corrected by retrying with a backoff.";
      break;
    case FIRFirestoreErrorCodeUnimplemented:
      code = @"unimplemented";
      message = @"Operation is not implemented or not supported/enabled.";
      break;
    case FIRFirestoreErrorCodeUnknown:
      code = @"unknown";
      message = @"Unknown error or an error from a different error domain.";
      break;
    default:
      code = @"unknown";
      message = @"An unknown error occurred.";
      break;
  }

  return @[code, message];
}

@end
