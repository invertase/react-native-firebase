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

#import "RCTConvert+FIRTextMessageArray.h"

@implementation RCTConvert (FIRTextMessageArray)
#if __has_include(<FirebaseMLNLSmartReply/FIRTextMessage.h>)
+ (FIRTextMessage *)FIRTextMessage:(id)json {
  NSDictionary *messageDict = [self NSDictionary:json];
  FIRTextMessage *firTextMessage = [
      [FIRTextMessage alloc]
      initWithText:messageDict[@"text"]
         timestamp:[[messageDict valueForKey:@"timestamp"] doubleValue]
            userID:messageDict[@"userId"] ? messageDict[@"userId"] : @""
       isLocalUser:messageDict[@"isLocalUser"] ? YES : NO
  ];
  return firTextMessage;
}

RCT_ARRAY_CONVERTER(FIRTextMessage)
#endif
@end
