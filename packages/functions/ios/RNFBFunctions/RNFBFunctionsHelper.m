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
#elif __has_include(<FirebaseCore/FirebaseCore.h>)
#import <FirebaseCore/FirebaseCore.h>
#else
@import FirebaseCore;
#endif

#if __has_include(<RNFBFunctions/RNFBFunctions-Swift.h>)
#import <RNFBFunctions/RNFBFunctions-Swift.h>
#elif __has_include("RNFBFunctions-Swift.h")
#import "RNFBFunctions-Swift.h"
#elif __has_include("RNFBFunctionsCallHandler-Swift.inc")
#import "RNFBFunctionsCallHandler-Swift.inc"
#else
#error "RNFBFunctionsCallHandler / StreamHandler Swift interface not found"
#endif

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBFunctionsHelper.h"

@implementation RNFBFunctionsHelper

static id RNFBFunctionsNormalizeCallableData(id data) {
  // JS often passes null; Swift sees Optional<Any> from valueForKey unless we
  // substitute NSNull so FirebaseFunctions serialization accepts the payload.
  if (data == nil) {
    return [NSNull null];
  }
  return data;
}

+ (void)httpsCallableWithAppName:(NSString *)appName
               customUrlOrRegion:(NSString *)customUrlOrRegion
                    emulatorHost:(NSString *_Nullable)emulatorHost
                    emulatorPort:(int)emulatorPort
                            name:(NSString *)name
                            data:(id _Nullable)data
                         timeout:(double)timeout
         limitedUseAppCheckToken:(BOOL)limitedUseAppCheckToken
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  id functions = [RNFBFunctionsCallHandler createFunctionsForApp:firebaseApp
                                               customUrlOrRegion:customUrlOrRegion
                                                    emulatorHost:emulatorHost
                                                    emulatorPort:emulatorPort];
  id callableData = RNFBFunctionsNormalizeCallableData(data);

  RNFBFunctionsCallHandler *handler = [[RNFBFunctionsCallHandler alloc] init];
  [handler callFunctionWithApp:firebaseApp
                     functions:functions
                          name:name
                          data:callableData
                       timeout:timeout
       limitedUseAppCheckToken:@(limitedUseAppCheckToken)
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

+ (void)httpsCallableFromUrlWithAppName:(NSString *)appName
                      customUrlOrRegion:(NSString *)customUrlOrRegion
                           emulatorHost:(NSString *_Nullable)emulatorHost
                           emulatorPort:(int)emulatorPort
                                    url:(NSString *)url
                                   data:(id _Nullable)data
                                timeout:(double)timeout
                limitedUseAppCheckToken:(BOOL)limitedUseAppCheckToken
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  id functions = [RNFBFunctionsCallHandler createFunctionsForApp:firebaseApp
                                               customUrlOrRegion:customUrlOrRegion
                                                    emulatorHost:emulatorHost
                                                    emulatorPort:emulatorPort];
  id callableData = RNFBFunctionsNormalizeCallableData(data);

  RNFBFunctionsCallHandler *handler = [[RNFBFunctionsCallHandler alloc] init];
  [handler
      callFunctionWithURLWithApp:firebaseApp
                       functions:functions
                             url:url
                            data:callableData
                         timeout:timeout
         limitedUseAppCheckToken:@(limitedUseAppCheckToken)
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

+ (id)createStreamHandler {
  return [[RNFBFunctionsStreamHandler alloc] init];
}

+ (void)startStreamOnHandler:(id)handler
                     appName:(NSString *)appName
           customUrlOrRegion:(NSString *)customUrlOrRegion
                emulatorHost:(NSString *_Nullable)emulatorHost
                emulatorPort:(int)emulatorPort
                functionName:(NSString *_Nullable)functionName
                 functionUrl:(NSString *_Nullable)functionUrl
                  parameters:(id _Nullable)parameters
                     timeout:(double)timeout
               eventCallback:(void (^)(NSDictionary *event))eventCallback {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  id functions = [RNFBFunctionsCallHandler createFunctionsForApp:firebaseApp
                                               customUrlOrRegion:customUrlOrRegion
                                                    emulatorHost:emulatorHost
                                                    emulatorPort:emulatorPort];
  id streamData = RNFBFunctionsNormalizeCallableData(parameters);

  RNFBFunctionsStreamHandler *streamHandler = (RNFBFunctionsStreamHandler *)handler;
  if (functionUrl != nil) {
    [streamHandler startStreamWithApp:firebaseApp
                            functions:functions
                          functionUrl:functionUrl
                           parameters:streamData
                              timeout:timeout
                        eventCallback:eventCallback];
  } else {
    [streamHandler startStreamWithApp:firebaseApp
                            functions:functions
                         functionName:functionName
                           parameters:streamData
                              timeout:timeout
                        eventCallback:eventCallback];
  }
}

@end
