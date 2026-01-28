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

static __strong NSMutableDictionary *streamListeners;

@implementation RNFBFunctionsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboFunctions)

- (instancetype)init {
  self = [super init];
  if (self) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      streamListeners = [[NSMutableDictionary alloc] init];
    });
  }
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  for (NSString *key in [streamListeners allKeys]) {
    id handler = streamListeners[key];
    if (handler && [handler respondsToSelector:@selector(cancel)]) {
      [handler cancel];
    }
    [streamListeners removeObjectForKey:key];
  }
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

  RNFBFunctionsCallHandler *handler = [[RNFBFunctionsCallHandler alloc] init];

  double timeoutValue = timeout.has_value() ? timeout.value() : 0;
  std::optional<bool> limitedUseAppCheckToken = options.limitedUseAppCheckTokens();
  NSNumber *limitedUseAppCheckTokenNumber =
      limitedUseAppCheckToken.has_value() ? @(limitedUseAppCheckToken.value()) : @(NO);

  [handler callFunctionWithApp:firebaseApp
                     functions:functions
                          name:name
                          data:callableData
                       timeout:timeoutValue
       limitedUseAppCheckToken:limitedUseAppCheckTokenNumber
                    completion:^(NSDictionary *_Nullable result, NSDictionary *_Nullable error) {
                      if (error) {
                        NSMutableDictionary *userInfo =
                            [NSMutableDictionary dictionaryWithDictionary:error];
                        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:userInfo];
                      } else {
                        resolve(result);
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
  std::optional<bool> limitedUseAppCheckToken = options.limitedUseAppCheckTokens();

  if (emulatorHost != nil) {
    [functions useEmulatorWithHost:emulatorHost port:(int)emulatorPort];
  }

  RNFBFunctionsCallHandler *handler = [[RNFBFunctionsCallHandler alloc] init];

  double timeoutValue = timeout.has_value() ? timeout.value() : 0;
  NSNumber *limitedUseAppCheckTokenNumber =
      limitedUseAppCheckToken.has_value() ? @(limitedUseAppCheckToken.value()) : @(NO);

  [handler
      callFunctionWithURLWithApp:firebaseApp
                       functions:functions
                             url:url
                            data:callableData
                         timeout:timeoutValue
         limitedUseAppCheckToken:limitedUseAppCheckTokenNumber
                      completion:^(NSDictionary *_Nullable result, NSDictionary *_Nullable error) {
                        if (error) {
                          NSMutableDictionary *userInfo =
                              [NSMutableDictionary dictionaryWithDictionary:error];
                          [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:userInfo];
                        } else {
                          resolve(result);
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
  [self streamSetup:appName
             region:customUrlOrRegion
       emulatorHost:emulatorHost
       emulatorPort:emulatorPort
               name:name
                url:nil
               data:data.data()
            timeout:options.timeout()
         listenerId:listenerId];
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
  [self streamSetup:appName
             region:customUrlOrRegion
       emulatorHost:emulatorHost
       emulatorPort:emulatorPort
               name:nil
                url:url
               data:data.data()
            timeout:options.timeout()
         listenerId:listenerId];
}

- (void)streamSetup:(NSString *)appName
             region:(NSString *)customUrlOrRegion
       emulatorHost:(NSString *_Nullable)emulatorHost
       emulatorPort:(double)emulatorPort
               name:(NSString *_Nullable)name
                url:(NSString *_Nullable)url
               data:(id)data
            timeout:(std::optional<double>)timeout
         listenerId:(double)listenerId {
  NSNumber *listenerIdNumber = @((int)listenerId);

  if (@available(iOS 15.0, macOS 12.0, *)) {
    NSURL *customUrl = [NSURL URLWithString:customUrlOrRegion];
    FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

    FIRFunctions *functions =
        (customUrl && customUrl.scheme && customUrl.host)
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

    void (^eventCallback)(NSDictionary *) = ^(NSDictionary *event) {
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
        [streamListeners removeObjectForKey:listenerIdNumber];
      }
    };

    // Call based on whether url or name is provided
    if (url != nil) {
      [handler startStreamWithApp:firebaseApp
                        functions:functions
                      functionUrl:url
                       parameters:data
                          timeout:timeoutValue
                    eventCallback:eventCallback];
    } else {
      [handler startStreamWithApp:firebaseApp
                        functions:functions
                     functionName:name
                       parameters:data
                          timeout:timeoutValue
                    eventCallback:eventCallback];
    }

    streamListeners[listenerIdNumber] = handler;
  } else {
    NSDictionary *eventBody = @{
      @"appName" : appName,
      @"eventName" : @"functions_streaming_event",
      @"listenerId" : listenerIdNumber,
      @"body" : @{
        @"data" : [NSNull null],
        @"error" : @{
          @"code" : @"cancelled",
          @"message" : @"callable streams require minimum iOS 15 or macOS 12",
          @"details" : [NSNull null]
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
  id handler = streamListeners[listenerIdNumber];
  if (handler) {
    [handler cancel];
  }

  [streamListeners removeObjectForKey:listenerIdNumber];
}

@end
