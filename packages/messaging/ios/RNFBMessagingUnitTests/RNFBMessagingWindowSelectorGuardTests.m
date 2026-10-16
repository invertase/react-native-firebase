/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

#import <XCTest/XCTest.h>

/// Scene-based apps often omit `window` on the app delegate. The production
/// NSNotificationCenter observer must probe `respondsToSelector:@selector(window)`
/// before reading `.window` (see `RNFBMessaging+NSNotificationCenter.m`).
@interface RNFBMessagingDelegateWithoutWindow : NSObject
@end

@implementation RNFBMessagingDelegateWithoutWindow
@end

@interface RNFBMessagingDelegateWithWindow : NSObject
@property(nonatomic, strong) id window;
@end

@implementation RNFBMessagingDelegateWithWindow
@end

@interface RNFBMessagingWindowSelectorGuardTests : XCTestCase
@end

@implementation RNFBMessagingWindowSelectorGuardTests

- (NSString *)notificationCenterSource {
  NSString *testDir = [@(__FILE__) stringByDeletingLastPathComponent];
  NSString *path = [[testDir
      stringByAppendingPathComponent:@"../RNFBMessaging/RNFBMessaging+NSNotificationCenter.m"]
      stringByStandardizingPath];
  NSString *contents = [NSString stringWithContentsOfFile:path
                                                 encoding:NSUTF8StringEncoding
                                                    error:nil];
  XCTAssertNotNil(contents, @"expected %@", path);
  return contents;
}

- (void)testFakeDelegateWithoutWindow_doesNotRespondToWindow {
  id delegate = [[RNFBMessagingDelegateWithoutWindow alloc] init];
  XCTAssertFalse([delegate respondsToSelector:@selector(window)]);
}

- (void)testFakeDelegateWithWindow_respondsToWindow {
  id delegate = [[RNFBMessagingDelegateWithWindow alloc] init];
  XCTAssertTrue([delegate respondsToSelector:@selector(window)]);
}

- (void)testProductionObserverGuardsWindowSelectorAtBothSites {
  NSString *source = [self notificationCenterSource];
  NSUInteger count = 0;
  NSRange search = NSMakeRange(0, source.length);
  NSString *needle = @"respondsToSelector:@selector(window)";
  while (search.location < source.length) {
    NSRange found = [source rangeOfString:needle options:0 range:search];
    if (found.location == NSNotFound) {
      break;
    }
    count += 1;
    NSUInteger next = found.location + found.length;
    search = NSMakeRange(next, source.length - next);
  }
  XCTAssertEqual(count, 2u);
}

@end
