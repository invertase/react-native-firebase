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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseFunctions/FirebaseFunctions.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseFunctions/FirebaseFunctions.h>
#elif __has_include(<FirebaseCore/FirebaseCore.h>)
#import <FirebaseCore/FirebaseCore.h>
// SPM: FirebaseFunctions is a pure-Swift module — no ObjC headers available.
// FIRFunctions instances are created via RNFBFunctionsCallHandler.createFunctions() factory.
#else
@import FirebaseCore;
#endif
#import <React/RCTUtils.h>

#import "NativeRNFBTurboFunctions.h"
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBRCTEventEmitter.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBFunctionsModule.h"

#if __has_include(<RNFBFunctions/RNFBFunctions-Swift.h>)
// This import will work in situations where `use_frameworks!` is in use
#import <RNFBFunctions/RNFBFunctions-Swift.h>
#elif __has_include("RNFBFunctions-Swift.h")
// If `use_frameworks!` is not in use (for example, while using pre-built
// react-native core) then header imports based on frameworks assumptions fail.
// So, if frameworks are not available, fall back to importing the header directly, it
// should be findable from a header search path pointing to the build
// directory. See firebase-ios-sdk#12611 for more context.
#import "RNFBFunctions-Swift.h"
#endif

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
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  // Use Swift factory — FirebaseFunctions is a pure-Swift SPM module,
  // cannot be imported directly from .mm files.
  id functions = [RNFBFunctionsCallHandler createFunctionsForApp:firebaseApp
                                              customUrlOrRegion:customUrlOrRegion
                                                   emulatorHost:emulatorHost
                                                   emulatorPort:(int)emulatorPort];

  id callableData = data.data();

  // In reality, this value is always null, because we always call it with null data
  // on the javascript side for some reason. Check for that case (which should be 100% of the time)
  // and set it to an `NSNull` (versus the `Optional<Any>` Swift will see from `valueForKey` so that
  // FirebaseFunctions serializer won't have a validation failure for an unknown type.
  if (callableData == nil) {
    callableData = [NSNull null];
  }

  std::optional<double> timeout = options.timeout();

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
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  id functions = [RNFBFunctionsCallHandler createFunctionsForApp:firebaseApp
                                              customUrlOrRegion:customUrlOrRegion
                                                   emulatorHost:emulatorHost
                                                   emulatorPort:(int)emulatorPort];

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
    FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

    id functions = [RNFBFunctionsCallHandler createFunctionsForApp:firebaseApp
                                                customUrlOrRegion:customUrlOrRegion
                                                     emulatorHost:emulatorHost
                                                     emulatorPort:(int)emulatorPort];

    if (data == nil) {
      data = [NSNull null];
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
        [self removeFunctionsStreamingListener:listenerIdNumber];
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
  [self removeFunctionsStreamingListener:listenerIdNumber];
}

- (void)removeFunctionsStreamingListener:(NSNumber *)listenerIdNumber {
  id handler = streamListeners[listenerIdNumber];
  if (handler) {
    [handler cancel];
  }
  [streamListeners removeObjectForKey:listenerIdNumber];
}

@end
