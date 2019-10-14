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

#import <React/RCTUtils.h>

#import "RNFBCrashlyticsModule.h"
#import "RNFBCrashlyticsInitProvider.h"
#import "RCTConvert.h"
#import "RNFBPreferences.h"
#import <Firebase/Firebase.h>
#import <Crashlytics/Crashlytics.h>

@implementation RNFBCrashlyticsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (NSDictionary *)constantsToExport {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isCrashlyticsCollectionEnabled"] = @([RCTConvert BOOL:@([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled])]);
  return constants;
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Firebase Crashlytics Methods

RCT_EXPORT_METHOD(crash) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[Crashlytics sharedInstance] crash];
  }
}

RCT_EXPORT_METHOD(log:
  (NSString *) message) {
  CLS_LOG(@"%@", message);
}

RCT_EXPORT_METHOD(logPromise:
  (NSString *) message
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  CLS_LOG(@"%@", message);
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setAttribute:
  (NSString *) key
      value:
      (NSString *) value
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[Crashlytics sharedInstance] setObjectValue:value forKey:key];
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setAttributes:
  (NSDictionary *) attributes
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    NSArray *keys = [attributes allKeys];

    for (NSString *key in keys) {
      [[Crashlytics sharedInstance] setObjectValue:attributes[key] forKey:key];
    }
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setUserId:
  (NSString *) userId
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[Crashlytics sharedInstance] setUserIdentifier:userId];
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setUserName:
  (NSString *) userName
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[Crashlytics sharedInstance] setUserName:userName];
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setUserEmail:
  (NSString *) userEmail
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[Crashlytics sharedInstance] setUserEmail:userEmail];
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(recordError:
  (NSDictionary *) jsErrorDict) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [self recordJavaScriptError:jsErrorDict];
  }
}

RCT_EXPORT_METHOD(recordErrorPromise:
  (NSDictionary *) jsErrorDict
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [self recordJavaScriptError:jsErrorDict];
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setCrashlyticsCollectionEnabled:
  (BOOL) enabled) {
  [[RNFBPreferences shared] setBooleanValue:@"crashlytics_auto_collection_enabled" boolValue:enabled];
}

- (void)recordJavaScriptError:(NSDictionary *)jsErrorDict {
  NSString *message = jsErrorDict[@"message"];
  NSDictionary *stackFrames = jsErrorDict[@"frames"];
  NSMutableArray *customFrames = [[NSMutableArray alloc] init];
  BOOL isUnhandledPromiseRejection = [jsErrorDict[@"isUnhandledRejection"] boolValue];

  for (NSDictionary *stackFrame in stackFrames) {
    CLSStackFrame *customFrame = [CLSStackFrame stackFrame];
    [customFrame setSymbol:stackFrame[@"fn"]];
    [customFrame setFileName:stackFrame[@"file"]];
    [customFrame setLibrary:stackFrame[@"src"]];
    [customFrame setOffset:(uint64_t) [stackFrame[@"col"] intValue]];
    [customFrame setLineNumber:(uint32_t) [stackFrame[@"line"] intValue]];
    [customFrames addObject:customFrame];
  }

  NSString *name = @"JavaScriptError";
  if (isUnhandledPromiseRejection) {
    name = @"UnhandledPromiseRejection";
  }

  [[Crashlytics sharedInstance] recordCustomExceptionName:name reason:message frameArray:customFrames];
}


@end
