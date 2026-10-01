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

NS_ASSUME_NONNULL_BEGIN

/// Foundation-only entry points. The implementation file is the only place
/// that imports the SDK.
BOOL RNFBFirebaseInstallationsLinked(void);
NS_RETURNS_RETAINED NSObject *RNFBFirebaseCreateOptions(const char *_Nullable googleAppID,
                                                        const char *_Nullable senderID);
NSString *_Nullable RNFBFirebaseOptionsGoogleAppID(NSObject *options);
NSString *_Nullable RNFBFirebaseOptionsGCMSenderID(NSObject *options);
NSString *_Nullable RNFBFirebaseOptionsAPIKey(NSObject *options);
void RNFBFirebaseOptionsSetAPIKey(NSObject *options, const char *_Nullable value);
NSString *_Nullable RNFBFirebaseOptionsProjectID(NSObject *options);
void RNFBFirebaseOptionsSetProjectID(NSObject *options, const char *_Nullable value);
NSString *_Nullable RNFBFirebaseOptionsClientID(NSObject *options);
void RNFBFirebaseOptionsSetClientID(NSObject *options, const char *_Nullable value);
NSString *_Nullable RNFBFirebaseOptionsDatabaseURL(NSObject *options);
void RNFBFirebaseOptionsSetDatabaseURL(NSObject *options, const char *_Nullable value);
NSString *_Nullable RNFBFirebaseOptionsStorageBucket(NSObject *options);
void RNFBFirebaseOptionsSetStorageBucket(NSObject *options, const char *_Nullable value);
NSString *_Nullable RNFBFirebaseOptionsBundleID(NSObject *options);
void RNFBFirebaseOptionsSetBundleID(NSObject *options, const char *value);
NSString *_Nullable RNFBFirebaseOptionsAppGroupID(NSObject *options);
void RNFBFirebaseOptionsSetAppGroupID(NSObject *options, const char *_Nullable value);
NSObject *_Nullable RNFBFirebaseDefaultApp(void);
NSObject *_Nullable RNFBFirebaseAppNamed(const char *name);
NSDictionary<NSString *, id> *_Nullable RNFBFirebaseAllApps(void);
void RNFBFirebaseConfigure(void);
void RNFBFirebaseConfigureWithOptions(NSObject *options);
void RNFBFirebaseConfigureWithName(const char *name, NSObject *options);
NSDictionary<NSString *, id> *RNFBFirebaseSnapshot(NSObject *app);
BOOL RNFBFirebaseSetDataCollectionDefaultEnabled(BOOL enabled, NSObject *app);
BOOL RNFBFirebaseDeleteApp(NSObject *app, void (^_Nonnull completion)(BOOL success));
void RNFBFirebaseSetLoggerLevel(NSInteger level);
void RNFBFirebaseRegisterLibrary(const char *name, const char *version);

NS_ASSUME_NONNULL_END
