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

#import <RNFBFunctions/RNFBFunctions-Swift.h>
#import "NativeRNFBTurboFunctions.h"
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBRCTEventEmitter.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBFunctionsModule.h"

@interface RNFBFunctionsModule ()
@property(nonatomic, strong) NSMutableDictionary<NSNumber *, id> *streamSubscriptions;
@end

@implementation RNFBFunctionsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboFunctions)

- (instancetype)init {
  self = [super init];
  if (self) {
    _streamSubscriptions = [NSMutableDictionary dictionary];
  }
  return self;
}

#pragma mark -
#pragma mark Firebase Functions Methods

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboFunctionsSpecJSI>(params);
}

- (void)httpsCallable:(NSString *)appName
               region:(NSString *)customUrlOrRegion
         emulatorHost:(NSString *_Nullable)emulatorHost
         emulatorPort:(double)emulatorPort
                 name:(NSString *)name
                 data:(JS::NativeRNFBTurboFunctions::SpecHttpsCallableData &)data
              options:(JS::NativeRNFBTurboFunctions::SpecHttpsCallableOptions &)options
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  NSURL *url = [NSURL URLWithString:customUrlOrRegion];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFunctions *functions =
      (url && url.scheme && url.host)
          ? [FIRFunctions functionsForApp:firebaseApp customDomain:customUrlOrRegion]
          : [FIRFunctions functionsForApp:firebaseApp region:customUrlOrRegion];

  id callableData = data.data();

  // In reality, this value is always null, because we always call it with null data
  // on the javascript side for some reason. Check for that case (which should be 100% of the time)
  // and set it to an `NSNull` (versus the `Optional<Any>` Swift will see from `valueForKey` so that
  // FirebaseFunctions serializer won't have a validation failure for an unknown type.
  if (callableData == nil) {
    callableData = [NSNull null];
  }

  std::optional<double> timeout = options.timeout();

  if (emulatorHost != nil) {
    [functions useEmulatorWithHost:emulatorHost port:(int)emulatorPort];
  }

  FIRHTTPSCallable *callable = [functions HTTPSCallableWithName:name];

  if (timeout.has_value()) {
    callable.timeoutInterval = timeout.value();
  }

  [callable callWithObject:callableData
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

- (void)httpsCallableFromUrl:(NSString *)appName
                      region:(NSString *)customUrlOrRegion
                emulatorHost:(NSString *_Nullable)emulatorHost
                emulatorPort:(double)emulatorPort
                         url:(NSString *)url
                        data:(JS::NativeRNFBTurboFunctions::SpecHttpsCallableFromUrlData &)data
                     options:
                         (JS::NativeRNFBTurboFunctions::SpecHttpsCallableFromUrlOptions &)options
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  NSURL *customUrl = [NSURL URLWithString:customUrlOrRegion];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFunctions *functions =
      (customUrl && customUrl.scheme && customUrl.host)
          ? [FIRFunctions functionsForApp:firebaseApp customDomain:customUrlOrRegion]
          : [FIRFunctions functionsForApp:firebaseApp region:customUrlOrRegion];

  id callableData = data.data();

  // In reality, this value is always null, because we always call it with null data
  // on the javascript side for some reason. Check for that case (which should be 100% of the time)
  // and set it to an `NSNull` (versus the `Optional<Any>` Swift will see from `valueForKey` so that
  // FirebaseFunctions serializer won't have a validation failure for an unknown type.
  if (callableData == nil) {
    callableData = [NSNull null];
  }

  std::optional<double> timeout = options.timeout();

  if (emulatorHost != nil) {
    [functions useEmulatorWithHost:emulatorHost port:(int)emulatorPort];
  }

  NSURL *functionUrl = [NSURL URLWithString:url];

  FIRHTTPSCallable *callable = [functions HTTPSCallableWithURL:functionUrl];

  if (timeout.has_value()) {
    callable.timeoutInterval = timeout.value();
  }

  [callable callWithObject:callableData
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

#pragma mark -
#pragma mark Firebase Functions Streaming Methods

- (void)httpsCallableStream:(NSString *)appName
                     region:(NSString *)customUrlOrRegion
               emulatorHost:(NSString *_Nullable)emulatorHost
               emulatorPort:(double)emulatorPort
                       name:(NSString *)name
                       data:(JS::NativeRNFBTurboFunctions::SpecHttpsCallableStreamData &)data
                    options:(JS::NativeRNFBTurboFunctions::SpecHttpsCallableStreamOptions &)options
                 listenerId:(double)listenerId {
  [self streamSetup:appName region:customUrlOrRegion emulatorHost:emulatorHost emulatorPort:emulatorPort urlOrName:name data:data.data() timeout:options.timeout() listenerId:listenerId];
}

- (void)
    httpsCallableStreamFromUrl:(NSString *)appName
                        region:(NSString *)customUrlOrRegion
                  emulatorHost:(NSString *_Nullable)emulatorHost
                  emulatorPort:(double)emulatorPort
                           url:(NSString *)url
                          data:(JS::NativeRNFBTurboFunctions::SpecHttpsCallableStreamFromUrlData &)
                                   data
                       options:
                           (JS::NativeRNFBTurboFunctions::SpecHttpsCallableStreamFromUrlOptions &)
                               options
                    listenerId:(double)listenerId {
  [self streamSetup:appName region:customUrlOrRegion emulatorHost:emulatorHost emulatorPort:emulatorPort urlOrName:url data:data.data() timeout:options.timeout() listenerId:listenerId];
}

- (void)streamSetup:(NSString *)appName
             region:(NSString *)customUrlOrRegion
       emulatorHost:(NSString *_Nullable)emulatorHost
       emulatorPort:(double)emulatorPort
                urlOrName:(NSString *)urlOrName
               data:(id)data
            timeout:(std::optional<double>)timeout
         listenerId:(double)listenerId {
  NSNumber *listenerIdNumber = @((int)listenerId);

  if (@available(iOS 15.0, macOS 12.0, *)) {
    NSURL *url = [NSURL URLWithString:customUrlOrRegion];
    FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

    FIRFunctions *functions =
        (url && url.scheme && url.host)
            ? [FIRFunctions functionsForApp:firebaseApp customDomain:customUrlOrRegion]
            : [FIRFunctions functionsForApp:firebaseApp region:customUrlOrRegion];


    if (data == nil) {
      data = [NSNull null];
    }

    if (emulatorHost != nil) {
      [functions useEmulatorWithHost:emulatorHost port:(int)emulatorPort];
    }

    RNFBFunctionsStreamHandler *handler = [[RNFBFunctionsStreamHandler alloc] init];

    double timeoutValue = timeout.has_value() ? timeout.value() : 0;

    [handler startStreamWithApp:firebaseApp
                      functions:functions
                   functionName:urlOrName
                     parameters:data
                        timeout:timeoutValue
                  eventCallback:^(NSDictionary *event) {
                    NSMutableDictionary *normalisedEvent = @{
                      @"appName" : appName,
                      @"eventName" : @"functions_streaming_event",
                      @"listenerId" : listenerIdNumber,
                      @"body" : event
                    };
                    [[RNFBRCTEventEmitter shared] sendEventWithName:@"functions_streaming_event"
                                                               body:normalisedEvent];

                    // Remove handler when done
                    if ([event[@"done"] boolValue]) {
                      [self.streamSubscriptions removeObjectForKey:listenerIdNumber];
                    }
                  }];

    self.streamSubscriptions[listenerIdNumber] = handler;
  } else {
    NSDictionary *eventBody = @{
      @"appName" : appName,
      @"eventName" : @"functions_streaming_event",
      @"listenerId" : listenerIdNumber,
      @"body" : @{
        @"data" : [NSNull null],
        @"error" : @{
          @"code" : @"cancelled",
          @"message" : @"callable streams require minimum iOS 15 or macOS 12"
        },
        @"done" : @NO
      }
    };
    [[RNFBRCTEventEmitter shared] sendEventWithName:@"functions_streaming_event" body:eventBody];
  }
}

- (void)removeFunctionsStreaming:(NSString *)appName
                          region:(NSString *)region
                      listenerId:(double)listenerId {
  NSNumber *listenerIdNumber = @((int)listenerId);
  id handler = self.streamSubscriptions[listenerIdNumber];

  if (handler != nil && handler != [NSNull null]) {
    if (@available(iOS 15.0, macOS 12.0, *)) {
#if __has_include("RNFBFunctions-Swift.h")
      if ([handler respondsToSelector:@selector(cancel)]) {
        [handler performSelector:@selector(cancel)];
      }
#endif
    }
    [self.streamSubscriptions removeObjectForKey:listenerIdNumber];
  } else if (handler == nil) {
    // Handler hasn't been created yet (async block hasn't executed)
    // Mark as cancelled so it won't be created
    self.streamSubscriptions[listenerIdNumber] = [NSNull null];
  }
  // If handler == [NSNull null], it was already cancelled, do nothing
}

#pragma mark -
#pragma mark Firebase Functions Helper Methods

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
