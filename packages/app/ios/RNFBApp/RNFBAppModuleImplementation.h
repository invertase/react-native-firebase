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
 */

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@class RCTBridge;

NS_ASSUME_NONNULL_BEGIN

FOUNDATION_EXPORT void RNFBAppModuleInitialize(void);
FOUNDATION_EXPORT void RNFBAppModuleSetBridge(RCTBridge *bridge);
FOUNDATION_EXPORT RCTBridge *RNFBAppModuleBridge(void);
FOUNDATION_EXPORT void RNFBAppModuleInvalidate(void);
FOUNDATION_EXPORT NSDictionary *RNFBAppModuleConstantsDictionary(void);

FOUNDATION_EXPORT void RNFBAppModuleInitializeApp(NSDictionary *options, NSDictionary *appConfig,
                                                  RCTPromiseResolveBlock resolve,
                                                  RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModuleCompleteInitializeApp(id _Nullable firApp,
                                                          NSString *_Nullable authDomain,
                                                          NSString *jsAppName,
                                                          NSDictionary *appConfig,
                                                          RCTPromiseResolveBlock resolve);
FOUNDATION_EXPORT void RNFBAppModuleSetAutomaticDataCollectionEnabled(NSString *appName,
                                                                      BOOL enabled);
FOUNDATION_EXPORT void RNFBAppModuleDeleteApp(NSString *appName, RCTPromiseResolveBlock resolve,
                                              RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModuleEventsNotifyReady(BOOL ready);
FOUNDATION_EXPORT void RNFBAppModuleEventsGetListeners(RCTPromiseResolveBlock resolve,
                                                       RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModuleEventsPing(NSString *eventName, NSDictionary *eventBody,
                                               RCTPromiseResolveBlock resolve,
                                               RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModuleEventsAddListener(NSString *eventName);
FOUNDATION_EXPORT void RNFBAppModuleEventsRemoveListener(NSString *eventName, BOOL all);
FOUNDATION_EXPORT void RNFBAppModuleAddListener(NSString *eventName);
FOUNDATION_EXPORT void RNFBAppModuleRemoveListeners(double count);
FOUNDATION_EXPORT void RNFBAppModuleMetaGetAll(RCTPromiseResolveBlock resolve,
                                               RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModuleJSONGetAll(RCTPromiseResolveBlock resolve,
                                               RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModulePreferencesSetBool(NSString *key, BOOL value,
                                                       RCTPromiseResolveBlock resolve,
                                                       RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModulePreferencesSetString(NSString *key, NSString *value,
                                                         RCTPromiseResolveBlock resolve,
                                                         RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModulePreferencesGetAll(RCTPromiseResolveBlock resolve,
                                                      RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModulePreferencesClearAll(RCTPromiseResolveBlock resolve,
                                                        RCTPromiseRejectBlock reject);
FOUNDATION_EXPORT void RNFBAppModuleSetLogLevel(NSString *logLevel);

NS_ASSUME_NONNULL_END
