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

// This module intentionally has no Firebase imports and no `*-Swift.h` —
// see RNFBFunctionsHelper.h. Every Firebase Core / Functions touch (and the
// Swift CallHandler / StreamHandler) is routed through the plain Objective-C
// RNFBFunctionsHelper class instead, which can safely import FirebaseCore and
// the generated Swift interface because it compiles as ObjC, not ObjC++.
#import "RNFBFunctionsModule.h"
#import "RNFBApp/RNFBRCTEventEmitter.h"
#import "RNFBFunctionsHelper.h"
#import "RNFBFunctionsStreamingRegistry.h"
#import "RNFBFunctionsTurboModules.h"

static RNFBFunctionsStreamingRegistry *streamListeners;

@implementation RNFBFunctionsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboFunctions)

- (instancetype)init {
  self = [super init];
  if (self) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      streamListeners = [[RNFBFunctionsStreamingRegistry alloc] init];
    });
  }
  return self;
}

- (void)invalidate {
  [streamListeners cancelAll];
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
  std::optional<double> timeout = options.timeout();
  std::optional<bool> limitedUseAppCheckToken = options.limitedUseAppCheckTokens();
  double timeoutValue = timeout.has_value() ? timeout.value() : 0;
  BOOL limitedUse = limitedUseAppCheckToken.has_value() ? limitedUseAppCheckToken.value() : NO;

  [RNFBFunctionsHelper httpsCallableWithAppName:appName
                              customUrlOrRegion:customUrlOrRegion
                                   emulatorHost:emulatorHost
                                   emulatorPort:(int)emulatorPort
                                           name:name
                                           data:data.data()
                                        timeout:timeoutValue
                        limitedUseAppCheckToken:limitedUse
                                        resolve:resolve
                                         reject:reject];
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
  std::optional<double> timeout = options.timeout();
  std::optional<bool> limitedUseAppCheckToken = options.limitedUseAppCheckTokens();
  double timeoutValue = timeout.has_value() ? timeout.value() : 0;
  BOOL limitedUse = limitedUseAppCheckToken.has_value() ? limitedUseAppCheckToken.value() : NO;

  [RNFBFunctionsHelper httpsCallableFromUrlWithAppName:appName
                                     customUrlOrRegion:customUrlOrRegion
                                          emulatorHost:emulatorHost
                                          emulatorPort:(int)emulatorPort
                                                   url:url
                                                  data:data.data()
                                               timeout:timeoutValue
                               limitedUseAppCheckToken:limitedUse
                                               resolve:resolve
                                                reject:reject];
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
    double timeoutValue = timeout.has_value() ? timeout.value() : 0;

    id handler = [RNFBFunctionsHelper createStreamHandler];

    void (^eventCallback)(NSDictionary *) = ^(NSDictionary *event) {
      if (![streamListeners shouldForwardEvent:event
                                    listenerId:listenerIdNumber
                                      expected:handler]) {
        return;
      }
      NSDictionary *normalisedEvent = @{
        @"appName" : appName,
        @"eventName" : @"functions_streaming_event",
        @"listenerId" : listenerIdNumber,
        @"body" : event
      };
      [[RNFBRCTEventEmitter shared] sendEventWithName:@"functions_streaming_event"
                                                 body:normalisedEvent];
    };

    NSString *collisionMessage = [streamListeners putOrCollisionMessage:listenerIdNumber
                                                                  value:handler];
    if (collisionMessage != nil) {
      NSDictionary *collisionEvent = @{
        @"appName" : appName,
        @"eventName" : @"functions_streaming_event",
        @"listenerId" : listenerIdNumber,
        @"body" : @{
          @"data" : [NSNull null],
          @"error" :
              @{@"code" : @"internal", @"message" : collisionMessage, @"details" : [NSNull null]},
          @"done" : @YES
        }
      };
      [[RNFBRCTEventEmitter shared] sendEventWithName:@"functions_streaming_event"
                                                 body:collisionEvent];
      return;
    }

    [RNFBFunctionsHelper startStreamOnHandler:handler
                                      appName:appName
                            customUrlOrRegion:customUrlOrRegion
                                 emulatorHost:emulatorHost
                                 emulatorPort:(int)emulatorPort
                                 functionName:name
                                  functionUrl:url
                                   parameters:data
                                      timeout:timeoutValue
                                eventCallback:eventCallback];
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
  [streamListeners takeAndCancel:listenerIdNumber];
}

@end
