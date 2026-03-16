/**
 * Copyright (c) 2023-present Invertase Limited & Contributors
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
#elif __has_include(<FirebaseAppCheck/FirebaseAppCheck.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseAppCheck/FirebaseAppCheck.h>
#else
@import FirebaseCore;
@import FirebaseAppCheck;
#endif

@interface RNFBAppCheckProvider : NSObject <FIRAppCheckProvider>

@property FIRApp *app;

@property id<FIRAppCheckProvider> delegateProvider;

- (void)configure:(FIRApp *)app
     providerName:(NSString *)providerName
       debugToken:(NSString *)debugToken;

- (id)initWithApp:(FIRApp *)app;

@end
