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

#import <XCTest/XCTest.h>

#import <Firebase/Firebase.h>
#import "RNFBCrashlyticsHelper.h"

@interface RNFBCrashlyticsFatalExitTests : XCTestCase
@end

@implementation RNFBCrashlyticsFatalExitTests {
  NSMutableArray<NSString *> *_events;
}

- (void)setUp {
  [super setUp];
  [FIRCrashlytics resetTestState];
  _events = [NSMutableArray new];
}

- (void)tearDown {
  [FIRCrashlytics resetTestState];
  [super tearDown];
}

- (void)appendEvent:(NSString *)event {
  @synchronized(_events) {
    [_events addObject:event];
  }
}

- (NSArray<NSString *> *)eventsSnapshot {
  @synchronized(_events) {
    return [_events copy];
  }
}

- (void)recordFatal {
  [RNFBCrashlyticsHelper recordJavaScriptErrorWithMessage:@"fatal"
                                                   frames:@[]
                              isUnhandledPromiseRejection:NO];
}

/** Lets late watchdog / queue blocks run so "at most once" assertions are meaningful. */
- (void)drainFor:(NSTimeInterval)seconds {
  XCTestExpectation *drained = [self expectationWithDescription:@"drained"];
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(seconds * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
                   [drained fulfill];
                 });
  [self waitForExpectations:@[ drained ] timeout:seconds + 5];
}

/** Returns once every block already enqueued on serial `queue` has run (a happens-before edge). */
- (void)drainQueue:(dispatch_queue_t)queue {
  dispatch_block_t noop = ^{
  };
  dispatch_sync(queue, noop);
}

- (void)testShared_isProductionSingleton {
  XCTAssertNotNil([RNFBCrashlyticsFatalExit shared]);
  XCTAssertEqual([RNFBCrashlyticsFatalExit shared], [RNFBCrashlyticsFatalExit shared]);
  XCTAssertEqualWithAccuracy(RNFBCrashlyticsFatalExitWatchdogTimeout, 2.0, 0.0001);
}

- (void)testRecordThenTerminate_savesOnMainBeforeTerminatorRuns {
  FIRCrashlytics.onExceptionModelSaved = ^(FIRExceptionModel *model) {
    [self appendEvent:[@"save:" stringByAppendingString:model.reason]];
  };
  XCTestExpectation *terminated = [self expectationWithDescription:@"terminated"];
  __block NSUInteger terminations = 0;
  // Held suspended until the main-queue terminate has run, so the watchdog cannot win under load.
  dispatch_queue_t watchdogQueue =
      dispatch_queue_create("rnfb.crashlytics.test.watchdog", DISPATCH_QUEUE_SERIAL);
  dispatch_suspend(watchdogQueue);
  RNFBCrashlyticsFatalExit *fatalExit = [[RNFBCrashlyticsFatalExit alloc]
      initWithTerminator:^{
        terminations += 1;
        [self appendEvent:@"exit"];
        XCTAssertTrue([NSThread isMainThread]);
        [terminated fulfill];
      }
          terminateQueue:dispatch_get_main_queue()
           watchdogQueue:watchdogQueue
         watchdogTimeout:0.2];

  // Production calls in on the module's own (non-main) method queue.
  __block BOOL started = NO;
  dispatch_queue_t moduleQueue =
      dispatch_queue_create("rnfb.crashlytics.test.module", DISPATCH_QUEUE_SERIAL);
  dispatch_async(moduleQueue, ^{
    started = [fatalExit recordThenTerminate:^{
      [self recordFatal];
    }];
  });

  [self waitForExpectations:@[ terminated ] timeout:5];
  dispatch_resume(watchdogQueue);
  [self drainFor:0.4];  // past the watchdog, which must not terminate again
  [self drainQueue:watchdogQueue];
  [self drainQueue:moduleQueue];  // `started` is written on moduleQueue

  XCTAssertTrue(started);
  XCTAssertEqual(terminations, 1u);
  NSArray *expected = @[ @"save:fatal", @"exit" ];
  XCTAssertEqualObjects([self eventsSnapshot], expected);
  XCTAssertEqual(FIRCrashlytics.savedExceptionModels.count, 1u);
  XCTAssertEqualObjects(FIRCrashlytics.savedExceptionModels.firstObject.name, @"JavaScriptError");
}

- (void)testRecordThenTerminate_contextInitPending_terminatesBeforeSave {
  [FIRCrashlytics holdContextInit];
  FIRCrashlytics.onExceptionModelSaved = ^(FIRExceptionModel *model) {
    [self appendEvent:[@"save:" stringByAppendingString:model.reason]];
  };
  XCTestExpectation *terminated = [self expectationWithDescription:@"terminated"];
  __block NSUInteger terminations = 0;
  __block NSUInteger savedAtExit = NSUIntegerMax;
  __block BOOL recordedAtExit = NO;
  dispatch_queue_t watchdogQueue =
      dispatch_queue_create("rnfb.crashlytics.test.watchdog", DISPATCH_QUEUE_SERIAL);
  dispatch_suspend(watchdogQueue);
  RNFBCrashlyticsFatalExit *fatalExit = [[RNFBCrashlyticsFatalExit alloc]
      initWithTerminator:^{
        terminations += 1;
        savedAtExit = FIRCrashlytics.savedExceptionModels.count;
        recordedAtExit = FIRCrashlytics.lastRecordedExceptionModel != nil;
        [self appendEvent:@"exit"];
        [FIRCrashlytics fulfillContextInit];
        [terminated fulfill];
      }
          terminateQueue:dispatch_get_main_queue()
           watchdogQueue:watchdogQueue
         watchdogTimeout:0.2];

  __block BOOL started = NO;
  dispatch_queue_t moduleQueue =
      dispatch_queue_create("rnfb.crashlytics.test.module", DISPATCH_QUEUE_SERIAL);
  dispatch_async(moduleQueue, ^{
    started = [fatalExit recordThenTerminate:^{
      [self recordFatal];
    }];
  });

  [self waitForExpectations:@[ terminated ] timeout:5];
  dispatch_resume(watchdogQueue);
  [self drainFor:0.4];
  [self drainQueue:watchdogQueue];
  [self drainQueue:moduleQueue];

  XCTAssertTrue(started);
  XCTAssertEqual(terminations, 1u);
  XCTAssertTrue(recordedAtExit);
  XCTAssertEqual(savedAtExit, 0u);
  NSArray *expected = @[ @"exit", @"save:fatal" ];
  XCTAssertEqualObjects([self eventsSnapshot], expected);
}

- (void)testWatchdog_terminatesWhenTerminateQueueIsHung {
  dispatch_queue_t hungQueue = dispatch_queue_create("rnfb.crashlytics.test.hung", 0);
  dispatch_semaphore_t release = dispatch_semaphore_create(0);
  dispatch_async(hungQueue, ^{
    dispatch_semaphore_wait(release, DISPATCH_TIME_FOREVER);
  });

  XCTestExpectation *terminated = [self expectationWithDescription:@"terminated"];
  __block NSUInteger terminations = 0;
  __block BOOL terminatedWhileHung = NO;
  __block BOOL hung = YES;
  RNFBCrashlyticsFatalExit *fatalExit = [[RNFBCrashlyticsFatalExit alloc]
      initWithTerminator:^{
        terminations += 1;
        terminatedWhileHung = hung;
        [terminated fulfill];
      }
          terminateQueue:hungQueue
           watchdogQueue:dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0)
         watchdogTimeout:0.1];

  XCTAssertTrue([fatalExit recordThenTerminate:^{
    [self recordFatal];
  }]);
  [self waitForExpectations:@[ terminated ] timeout:5];

  hung = NO;
  dispatch_semaphore_signal(release);
  [self drainQueue:hungQueue];  // the queued terminate block has now run

  XCTAssertTrue(terminatedWhileHung);
  XCTAssertEqual(terminations, 1u);
}

- (void)testRecordRaises_stillTerminatesAndIgnoresLaterFatals {
  XCTestExpectation *terminated = [self expectationWithDescription:@"terminated"];
  __block NSUInteger terminations = 0;
  RNFBCrashlyticsFatalExit *fatalExit = [[RNFBCrashlyticsFatalExit alloc]
      initWithTerminator:^{
        terminations += 1;
        [terminated fulfill];
      }
          terminateQueue:dispatch_get_main_queue()
           watchdogQueue:dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0)
         watchdogTimeout:0.1];

  BOOL first = [fatalExit recordThenTerminate:^{
    [NSException raise:NSInternalInconsistencyException format:@"record failed"];
  }];
  BOOL second = [fatalExit recordThenTerminate:^{
    [self recordFatal];
  }];

  [self waitForExpectations:@[ terminated ] timeout:5];
  [self drainFor:0.3];

  XCTAssertTrue(first);
  XCTAssertFalse(second);
  XCTAssertEqual(terminations, 1u);
  XCTAssertEqual(FIRCrashlytics.savedExceptionModels.count, 0u);
}

- (void)testSecondFatalWhileTerminating_isIgnored {
  XCTestExpectation *terminated = [self expectationWithDescription:@"terminated"];
  __block NSUInteger terminations = 0;
  __block NSUInteger records = 0;
  RNFBCrashlyticsFatalExit *fatalExit = [[RNFBCrashlyticsFatalExit alloc]
      initWithTerminator:^{
        terminations += 1;
        [terminated fulfill];
      }
          terminateQueue:dispatch_get_main_queue()
           watchdogQueue:dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0)
         watchdogTimeout:0.1];

  BOOL first = [fatalExit recordThenTerminate:^{
    records += 1;
    [self recordFatal];
  }];
  BOOL second = [fatalExit recordThenTerminate:^{
    records += 1;
    [self recordFatal];
  }];

  [self waitForExpectations:@[ terminated ] timeout:5];
  [self drainFor:0.3];

  XCTAssertTrue(first);
  XCTAssertFalse(second);
  XCTAssertEqual(records, 1u);
  XCTAssertEqual(terminations, 1u);
  XCTAssertEqual(FIRCrashlytics.savedExceptionModels.count, 1u);
}

@end
