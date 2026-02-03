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

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBFunctionsModule.h"

@implementation RNFBFunctionsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase Functions Methods

RCT_EXPORT_METHOD(httpsCallable
                  : (FIRApp *)firebaseApp customUrlOrRegion
                  : (NSString *)customUrlOrRegion host
                  : (NSString *)host port
                  : (NSNumber *_Nonnull)port name
                  : (NSString *)name wrapper
                  : (NSDictionary *)wrapper options
                  : (NSDictionary *)options resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  NSURL *url = [NSURL URLWithString:customUrlOrRegion];
  FIRFunctions *functions =
      (url && url.scheme && url.host)
          ? [FIRFunctions functionsForApp:firebaseApp customDomain:customUrlOrRegion]
          : [FIRFunctions functionsForApp:firebaseApp region:customUrlOrRegion];

  if (host != nil) {
    [functions useEmulatorWithHost:host port:[port intValue]];
  }

  FIRHTTPSCallable *callable = [functions HTTPSCallableWithName:name];

  if (options[@"timeout"]) {
    callable.timeoutInterval = [options[@"timeout"] doubleValue];
  }

  // In reality, this value is always null, because we always call it with null data
  // on the javascript side for some reason. Check for that case (which should be 100% of the time)
  // and set it to an `NSNull` (versus the `Optional<Any>` Swift will see from `valueForKey` so that
  // FirebaseFunctions serializer won't have a validation failure for an unknown type.
  id data = [wrapper valueForKey:@"data"];
  NSLog(@"RNFBFUNCTIONS pulled data from 'wrapper', has type %@", [data class]);
  if (data == nil) {
    data = [NSNull null];
  }

  [callable callWithObject:data
                completion:^(FIRHTTPSCallableResult *_Nullable result, NSError *_Nullable error) {
                  if (error) {
                    NSObject *details = [NSNull null];
                    NSString *message = error.localizedDescription;
                    NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
                    if ([error.domain isEqual:@"com.firebase.functions"]) {
                      details = error.userInfo[@"details"];
                      if (details == nil) {
                        details = [NSNull null];
                      }
                    }

                    userInfo[@"code"] = [self getErrorCodeName:error];
                    userInfo[@"message"] = message;
                    userInfo[@"details"] = details;

                    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:userInfo];
                  } else {
                    resolve(@{@"data" : [result data]});
                  }
                }];
}

RCT_EXPORT_METHOD(httpsCallableFromUrl
                  : (FIRApp *)firebaseApp customUrlOrRegion
                  : (NSString *)customUrlOrRegion host
                  : (NSString *)host port
                  : (NSNumber *_Nonnull)port url
                  : (NSString *)url wrapper
                  : (NSDictionary *)wrapper options
                  : (NSDictionary *)options resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  NSURL *customUrl = [NSURL URLWithString:customUrlOrRegion];
  FIRFunctions *functions =
      (customUrl && customUrl.scheme && customUrl.host)
          ? [FIRFunctions functionsForApp:firebaseApp customDomain:customUrlOrRegion]
          : [FIRFunctions functionsForApp:firebaseApp region:customUrlOrRegion];

  if (host != nil) {
    [functions useEmulatorWithHost:host port:[port intValue]];
  }

  NSURL *functionUrl = [NSURL URLWithString:url];

  FIRHTTPSCallable *callable = [functions HTTPSCallableWithURL:functionUrl];

  if (options[@"timeout"]) {
    callable.timeoutInterval = [options[@"timeout"] doubleValue];
  }

  // In reality, this value is always null, because we always call it with null data
  // on the javascript side for some reason. Check for that case (which should be 100% of the time)
  // and set it to an `NSNull` (versus the `Optional<Any>` Swift will see from `valueForKey` so that
  // FirebaseFunctions serializer won't have a validation failure for an unknown type.
  id data = [wrapper valueForKey:@"data"];
  if (data == nil) {
    data = [NSNull null];
  }

  [callable callWithObject:data
                completion:^(FIRHTTPSCallableResult *_Nullable result, NSError *_Nullable error) {
                  if (error) {
                    NSObject *details = [NSNull null];
                    NSString *message = error.localizedDescription;
                    NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
                    if ([error.domain isEqual:@"com.firebase.functions"]) {
                      details = error.userInfo[@"details"];
                      if (details == nil) {
                        details = [NSNull null];
                      }
                    }

                    userInfo[@"code"] = [self getErrorCodeName:error];
                    userInfo[@"message"] = message;
                    userInfo[@"details"] = details;

                    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:userInfo];
                  } else {
                    resolve(@{@"data" : [result data]});
                  }
                }];
}

- (NSString *)getErrorCodeName:(NSError *)error {
  NSString *code = @"UNKNOWN";

  if ([error.domain isEqual:@"com.firebase.functions"]) {
    switch (error.code) {
      case FIRFunctionsErrorCodeOK:
        code = @"OK";
        break;
      case FIRFunctionsErrorCodeCancelled:
        code = @"CANCELLED";
        break;
      case FIRFunctionsErrorCodeUnknown:
        code = @"UNKNOWN";
        break;
      case FIRFunctionsErrorCodeInvalidArgument:
        code = @"INVALID_ARGUMENT";
        break;
      case FIRFunctionsErrorCodeDeadlineExceeded:
        code = @"DEADLINE_EXCEEDED";
        break;
      case FIRFunctionsErrorCodeNotFound:
        code = @"NOT_FOUND";
        break;
      case FIRFunctionsErrorCodeAlreadyExists:
        code = @"ALREADY_EXISTS";
        break;
      case FIRFunctionsErrorCodePermissionDenied:
        code = @"PERMISSION_DENIED";
        break;
      case FIRFunctionsErrorCodeResourceExhausted:
        code = @"RESOURCE_EXHAUSTED";
        break;
      case FIRFunctionsErrorCodeFailedPrecondition:
        code = @"FAILED_PRECONDITION";
        break;
      case FIRFunctionsErrorCodeAborted:
        code = @"ABORTED";
        break;
      case FIRFunctionsErrorCodeOutOfRange:
        code = @"OUT_OF_RANGE";
        break;
      case FIRFunctionsErrorCodeUnimplemented:
        code = @"UNIMPLEMENTED";
        break;
      case FIRFunctionsErrorCodeInternal:
        code = @"INTERNAL";
        break;
      case FIRFunctionsErrorCodeUnavailable:
        code = @"UNAVAILABLE";
        break;
      case FIRFunctionsErrorCodeDataLoss:
        code = @"DATA_LOSS";
        break;
      case FIRFunctionsErrorCodeUnauthenticated:
        code = @"UNAUTHENTICATED";
        break;
      default:
        break;
    }
  }
  if ([error.domain isEqual:@"FirebaseFunctions.FunctionsSerializer.Error"]) {
    NSLog(@"RNFBFUNCTIONS error description: %@", error.description);
    if ([error.description containsString:@"unsupportedType"]) {
      code = @"UNSUPPORTED_TYPE";
    }
    if ([error.description containsString:@"failedToParseWrappedNumber"]) {
      code = @"FAILED_TO_PARSE_WRAPPED_NUMBER";
    }
  }

  return code;
}

@end
