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

#import "RNFBFirebaseBridge.h"

#import <objc/message.h>

@import FirebaseCore;
@import FirebaseInstallations;

static FIROptions *RNFBFirebaseOptions(NSObject *options) { return (FIROptions *)options; }

static id RNFBFirebaseNilOrString(NSString *_Nullable value) { return value ?: [NSNull null]; }

static NSString *RNFBFirebaseString(const char *value) {
  return value == NULL ? nil : [NSString stringWithUTF8String:value];
}

// Link anchor, not API. Nothing else in this bridge uses FirebaseInstallations, so this class
// reference is what makes the RNFBFirebase dynamic product take a symbol dependency on the
// FirebaseInstallations package product (declared in Package.swift, requested by
// RNFBApp.podspec) instead of only importing its module. Its only caller is
// RNFBFirebaseAppClientTests.testInstallationsLinkageAnchorIsDistinctFromNSObject.
BOOL RNFBFirebaseInstallationsLinked(void) { return [FIRInstallations class] != [NSObject class]; }

NS_RETURNS_RETAINED NSObject *RNFBFirebaseCreateOptions(const char *googleAppID,
                                                        const char *senderID) {
  // alloc and initWithGoogleAppID:GCMSenderID: are each +1. The function name
  // contains Create, so ARC returns the object at +1. That is the same retain
  // balance as takeRetainedValue plus Unmanaged.passRetained on perform.
  return [[FIROptions alloc] initWithGoogleAppID:RNFBFirebaseString(googleAppID)
                                     GCMSenderID:RNFBFirebaseString(senderID)];
}

NSString *RNFBFirebaseOptionsAPIKey(NSObject *options) {
  return RNFBFirebaseOptions(options).APIKey;
}

void RNFBFirebaseOptionsSetAPIKey(NSObject *options, const char *value) {
  RNFBFirebaseOptions(options).APIKey = RNFBFirebaseString(value);
}

NSString *RNFBFirebaseOptionsProjectID(NSObject *options) {
  return RNFBFirebaseOptions(options).projectID;
}

void RNFBFirebaseOptionsSetProjectID(NSObject *options, const char *value) {
  RNFBFirebaseOptions(options).projectID = RNFBFirebaseString(value);
}

NSString *RNFBFirebaseOptionsClientID(NSObject *options) {
  return RNFBFirebaseOptions(options).clientID;
}

void RNFBFirebaseOptionsSetClientID(NSObject *options, const char *value) {
  RNFBFirebaseOptions(options).clientID = RNFBFirebaseString(value);
}

NSString *RNFBFirebaseOptionsDatabaseURL(NSObject *options) {
  return RNFBFirebaseOptions(options).databaseURL;
}

void RNFBFirebaseOptionsSetDatabaseURL(NSObject *options, const char *value) {
  RNFBFirebaseOptions(options).databaseURL = RNFBFirebaseString(value);
}

NSString *RNFBFirebaseOptionsStorageBucket(NSObject *options) {
  return RNFBFirebaseOptions(options).storageBucket;
}

void RNFBFirebaseOptionsSetStorageBucket(NSObject *options, const char *value) {
  RNFBFirebaseOptions(options).storageBucket = RNFBFirebaseString(value);
}

NSString *RNFBFirebaseOptionsBundleID(NSObject *options) {
  return RNFBFirebaseOptions(options).bundleID;
}

void RNFBFirebaseOptionsSetBundleID(NSObject *options, const char *value) {
  RNFBFirebaseOptions(options).bundleID = RNFBFirebaseString(value);
}

NSString *RNFBFirebaseOptionsAppGroupID(NSObject *options) {
  return RNFBFirebaseOptions(options).appGroupID;
}

void RNFBFirebaseOptionsSetAppGroupID(NSObject *options, const char *value) {
  RNFBFirebaseOptions(options).appGroupID = RNFBFirebaseString(value);
}

NSObject *RNFBFirebaseDefaultApp(void) { return [FIRApp defaultApp]; }

NSObject *RNFBFirebaseAppNamed(const char *name) {
  return [FIRApp appNamed:RNFBFirebaseString(name)];
}

NSDictionary<NSString *, id> *RNFBFirebaseAllApps(void) { return [FIRApp allApps]; }

void RNFBFirebaseConfigure(void) { [FIRApp configure]; }

void RNFBFirebaseConfigureWithOptions(NSObject *options) {
  [FIRApp configureWithOptions:RNFBFirebaseOptions(options)];
}

void RNFBFirebaseConfigureWithName(const char *name, NSObject *options) {
  [FIRApp configureWithName:RNFBFirebaseString(name) options:RNFBFirebaseOptions(options)];
}

NSDictionary<NSString *, id> *RNFBFirebaseSnapshot(NSObject *app) {
  FIRApp *firebaseApp = (FIRApp *)app;
  FIROptions *options = firebaseApp.options;
  return @{
    @"name" : firebaseApp.name,
    @"apiKey" : RNFBFirebaseNilOrString(options.APIKey),
    @"googleAppID" : RNFBFirebaseNilOrString(options.googleAppID),
    @"projectID" : RNFBFirebaseNilOrString(options.projectID),
    @"databaseURL" : RNFBFirebaseNilOrString(options.databaseURL),
    @"storageBucket" : RNFBFirebaseNilOrString(options.storageBucket),
    @"gcmSenderID" : RNFBFirebaseNilOrString(options.GCMSenderID),
    @"clientID" : RNFBFirebaseNilOrString(options.clientID),
    @"isDataCollectionDefaultEnabled" : @(firebaseApp.isDataCollectionDefaultEnabled),
  };
}

BOOL RNFBFirebaseSetDataCollectionDefaultEnabled(BOOL enabled, NSObject *app) {
  if (![app isKindOfClass:[FIRApp class]]) {
    return NO;
  }
  ((FIRApp *)app).dataCollectionDefaultEnabled = enabled;
  return YES;
}

BOOL RNFBFirebaseDeleteApp(NSObject *app, void (^completion)(BOOL)) {
  if (![app isKindOfClass:[FIRApp class]]) {
    return NO;
  }
  [(FIRApp *)app deleteApp:completion];
  return YES;
}

void RNFBFirebaseSetLoggerLevel(NSInteger level) {
  // Unknown raw values pass through. Do not clamp them to FIRLoggerLevelError.
  [[FIRConfiguration sharedInstance] setLoggerLevel:(FIRLoggerLevel)level];
}

void RNFBFirebaseRegisterLibrary(const char *name, const char *version) {
  SEL selector = NSSelectorFromString(@"registerLibrary:withVersion:");
  if (![FIRApp respondsToSelector:selector]) {
    return;
  }
  NSString *libraryName = RNFBFirebaseString(name);
  NSString *libraryVersion = RNFBFirebaseString(version);
  void (*send)(id, SEL, NSString *, NSString *) =
      (void (*)(id, SEL, NSString *, NSString *))objc_msgSend;
  send([FIRApp class], selector, libraryName, libraryVersion);
}
