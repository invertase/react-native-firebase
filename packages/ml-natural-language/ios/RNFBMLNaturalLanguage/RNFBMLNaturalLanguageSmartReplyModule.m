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

#import "RNFBMLNaturalLanguageSmartReplyModule.h"

#if __has_include(<FirebaseMLNLSmartReply/FIRTextMessage.h>)
#import <Firebase/Firebase.h>
#import "RNFBSharedUtils.h"
#define DEPENDENCY_EXISTS=1
#endif

@implementation RNFBMLNaturalLanguageSmartReplyModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase Mlkit Smart Reply Methods

#ifdef DEPENDENCY_EXISTS
RCT_EXPORT_METHOD(suggestReplies:
  (FIRApp *) firebaseApp
    : (NSArray<FIRTextMessage *> *)messages
    : (RCTPromiseResolveBlock)resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRNaturalLanguage *naturalLanguage = [FIRNaturalLanguage naturalLanguage];
  FIRSmartReply *smartReply = [naturalLanguage smartReply];

  FIRSmartReplyCallback completion = ^(
      FIRSmartReplySuggestionResult *_Nullable result,
      NSError *_Nullable error
  ) {
    if (error != nil) {
      [self promiseRejectMLKitException:reject error:error];
      return;
    }

    if (result.status == FIRSmartReplyResultStatusSuccess) {
      NSMutableArray *smartReplies = [[NSMutableArray alloc] initWithCapacity:result.suggestions.count];

      for (FIRSmartReplySuggestion *suggestion in result.suggestions) {
        NSMutableDictionary *smartReplyDict = [NSMutableDictionary dictionary];
        smartReplyDict[@"text"] = suggestion.text;
        [smartReplies addObject:smartReplyDict];
      }

      resolve(smartReplies);
    } else {
      resolve(@[]);
    }
  };

  [smartReply suggestRepliesForMessages:messages completion:completion];
}

- (void)promiseRejectMLKitException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  // TODO no way to distinguish between the error codes like Android supports
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
      @"code": @"unknown",
      @"message": [error localizedDescription],
  }];
}
#endif

@end
