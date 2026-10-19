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

#import <XCTest/XCTest.h>
#import <objc/runtime.h>

#import "RNFBNullSentinelInterceptor.h"

/** Set by the original (pre-swizzle) IMPs of every runtime-created stand-in class. */
static id gLastJsonSeenByOriginalIMP = nil;

static NSString *const kSpecSelector = @"JS_NativeRNFBTurboFunctions_SpecHttpsCallableData:";
/** Prefix matches JS_NativeRNFBTurbo* but lacks _Spec: must not be wrapped. */
static NSString *const kNotASpecSelector = @"JS_NativeRNFBTurboFunctions_NotASpecMethod:";
static NSString *const kUnrelatedSelector = @"unrelatedConverter:";
static NSString *const kCxxConvertSpecSelector = @"JS_NativeRNFBTurboApp_SpecData:";
static NSString *const kCxxConvertClassName = @"RCTCxxConvert";

@interface RNFBNullSentinelInterceptorTests : XCTestCase
@end

/**
 * Each test that needs a class builds its own uniquely named one at runtime and disposes of it in
 * tearDown, so no test observes IMP wrapping or a global RCTCxxConvert registered by another test.
 * That makes the suite independent of XCTest execution order and safe to run singly.
 */
@implementation RNFBNullSentinelInterceptorTests {
  // Class pointers are stored as NSValue so ARC never retains/releases a class after disposal.
  // Per-test stand-ins: scheduled blocks may capture these, so tearDown spares them on a drain
  // timeout.
  NSMutableArray<NSValue *> *_standInClasses;
  // Fake global RCTCxxConvert: nothing queued captures it, so tearDown always disposes it.
  NSMutableArray<NSValue *> *_globalClasses;
  // Class pointer -> the IMPs of the block-backed methods this test added to it.
  NSMutableDictionary<NSValue *, NSArray<NSValue *> *> *_originalIMPsByClass;
  // Heap-allocated dispatch_once_t storage (see -newOnceToken), freed in tearDown.
  NSMutableArray<NSValue *> *_onceTokens;
}

- (void)setUp {
  [super setUp];
  gLastJsonSeenByOriginalIMP = nil;
  _standInClasses = [NSMutableArray array];
  _globalClasses = [NSMutableArray array];
  _originalIMPsByClass = [NSMutableDictionary dictionary];
  _onceTokens = [NSMutableArray array];
}

- (void)tearDown {
  // schedule...WithOnceToken: dispatches a block to the main queue that captures the once token
  // pointer and the stand-in class. Drain the main queue (FIFO, so every block queued by the test
  // has run once the drain block does) before disposing those or freeing the token. If the drain
  // times out, leak them instead of risking a use-after-free in a late block. The global
  // RCTCxxConvert is never captured by a queued block, so it is always disposed; otherwise a
  // leaked registration would fail every later RCTCxxConvert test.
  BOOL drained = [self drainMainQueue];
  [self disposeClasses:_globalClasses];
  if (drained) {
    [self disposeClasses:_standInClasses];
    for (NSValue *tokenValue in _onceTokens) {
      free(tokenValue.pointerValue);
    }
  }
  [_standInClasses removeAllObjects];
  [_globalClasses removeAllObjects];
  [_originalIMPsByClass removeAllObjects];
  [_onceTokens removeAllObjects];
  gLastJsonSeenByOriginalIMP = nil;
  [super tearDown];
}

/**
 * Disposes of the given classes and removes their block-backed IMPs. Each block IMP must be
 * removed exactly once (a second imp_removeBlock crashes), so gather the unique set per class: the
 * original stand-in IMPs plus any wrapper IMPs the interceptor swizzled in.
 */
- (void)disposeClasses:(NSArray<NSValue *> *)classValues {
  for (NSValue *classValue in classValues) {
    __unsafe_unretained Class cls = (__bridge Class)classValue.pointerValue;
    NSMutableSet<NSValue *> *blockIMPs =
        [NSMutableSet setWithArray:_originalIMPsByClass[classValue] ?: @[]];
    unsigned int count = 0;
    Method *methods = class_copyMethodList(object_getClass(cls), &count);
    for (unsigned int i = 0; i < count; i++) {
      [blockIMPs
          addObject:[NSValue valueWithPointer:(const void *)method_getImplementation(methods[i])]];
    }
    free(methods);
    objc_disposeClassPair(cls);
    for (NSValue *value in blockIMPs) {
      imp_removeBlock((IMP)value.pointerValue);
    }
  }
}

/**
 * Creates and registers a class named `name` whose class methods (one per selector name) record
 * the received json in gLastJsonSeenByOriginalIMP and return it. Disposed in tearDown. `global`
 * marks a class registered under a well-known global name (RCTCxxConvert).
 */
- (Class)registerClassNamed:(NSString *)name
              selectorNames:(NSArray<NSString *> *)selectorNames
                     global:(BOOL)global {
  Class cls = objc_allocateClassPair([NSObject class], name.UTF8String, 0);
  XCTAssertTrue(cls != Nil, @"could not allocate class %@", name);
  if (cls == Nil) {
    return Nil;
  }
  Class meta = object_getClass(cls);
  NSMutableArray<NSValue *> *imps = [NSMutableArray array];
  for (NSString *selectorName in selectorNames) {
    IMP imp = imp_implementationWithBlock(^id(__unused id receiver, id json) {
      gLastJsonSeenByOriginalIMP = json;
      return json;
    });
    BOOL added = class_addMethod(meta, NSSelectorFromString(selectorName), imp, "@@:@");
    XCTAssertTrue(added, @"could not add class method %@ to %@", selectorName, name);
    [imps addObject:[NSValue valueWithPointer:(const void *)imp]];
  }
  objc_registerClassPair(cls);
  NSValue *classValue = [NSValue valueWithPointer:(__bridge const void *)cls];
  _originalIMPsByClass[classValue] = imps;
  [global ? _globalClasses : _standInClasses addObject:classValue];
  return cls;
}

/** Stand-in for RCTCxxConvert codegen categories, uniquely named per call. */
- (Class)makeStandInConvertClass {
  static NSUInteger counter = 0;  // XCTest runs test methods serially on one thread.
  NSString *name =
      [NSString stringWithFormat:@"RNFBNullSentinelStandInConvert_%lu", (unsigned long)++counter];
  return [self registerClassNamed:name
                    selectorNames:@[ kSpecSelector, kNotASpecSelector, kUnrelatedSelector ]
                           global:NO];
}

- (NSDictionary *)nullSentinel {
  return @{@"__rnfbNull" : @YES};
}

- (NSDictionary *)unrelatedOneKeyDictionary {
  return @{@".sv" : @"timestamp"};
}

- (IMP)classMethodIMP:(Class)cls selector:(SEL)selector {
  Method method = class_getClassMethod(cls, selector);
  XCTAssertTrue(method != NULL, @"missing class method %@", NSStringFromSelector(selector));
  return method_getImplementation(method);
}

/** Invokes the class method's current IMP, so swizzled wrappers are exercised. */
- (id)callConvert:(Class)cls selectorName:(NSString *)selectorName json:(id)json {
  typedef id (*ConvertFunc)(id, SEL, id);
  SEL selector = NSSelectorFromString(selectorName);
  ConvertFunc convert = (ConvertFunc)[self classMethodIMP:cls selector:selector];
  return convert(cls, selector, json);
}

/**
 * Heap-allocated once token. A stack token would dangle if a dispatched block ran after the test
 * method returned. Freed in tearDown, after the main queue is drained.
 */
- (dispatch_once_t *)newOnceToken {
  dispatch_once_t *token = calloc(1, sizeof(dispatch_once_t));
  [_onceTokens addObject:[NSValue valueWithPointer:token]];
  return token;
}

/** Returns YES once every main-queue block queued before this call has run. */
- (BOOL)drainMainQueue {
  XCTestExpectation *drained = [self expectationWithDescription:@"main queue drained"];
  dispatch_async(dispatch_get_main_queue(), ^{
    [drained fulfill];
  });
  XCTWaiterResult result = [XCTWaiter waitForExpectations:@[ drained ] timeout:2.0];
  XCTAssertEqual(result, XCTWaiterResultCompleted, @"main queue did not drain in time");
  return result == XCTWaiterResultCompleted;
}

- (void)testSwizzleTurboModuleConversions_nullSentinel_handsNSNullToOriginalIMP {
  Class standIn = [self makeStandInConvertClass];
  SEL selector = NSSelectorFromString(kSpecSelector);
  IMP before = [self classMethodIMP:standIn selector:selector];

  [RNFBNullSentinelInterceptor swizzleTurboModuleConversions:standIn];

  IMP after = [self classMethodIMP:standIn selector:selector];
  XCTAssertNotEqual(before, after);

  gLastJsonSeenByOriginalIMP = nil;
  id result = [self callConvert:standIn selectorName:kSpecSelector json:[self nullSentinel]];
  XCTAssertEqualObjects(gLastJsonSeenByOriginalIMP, [NSNull null]);
  XCTAssertEqualObjects(result, [NSNull null]);
}

- (void)testSwizzleTurboModuleConversions_unrelatedOneKeyDictionary_unchanged {
  Class standIn = [self makeStandInConvertClass];
  [RNFBNullSentinelInterceptor swizzleTurboModuleConversions:standIn];

  gLastJsonSeenByOriginalIMP = nil;
  NSDictionary *payload = [self unrelatedOneKeyDictionary];
  id result = [self callConvert:standIn selectorName:kSpecSelector json:payload];

  XCTAssertEqualObjects(gLastJsonSeenByOriginalIMP, payload);
  XCTAssertEqualObjects(result, payload);
}

- (void)testScheduleSwizzle_doesNotSwizzleUntilMainQueueRuns {
  Class standIn = [self makeStandInConvertClass];
  SEL selector = NSSelectorFromString(kSpecSelector);
  IMP before = [self classMethodIMP:standIn selector:selector];

  dispatch_once_t *onceToken = [self newOnceToken];
  [RNFBNullSentinelInterceptor scheduleSwizzleOnMainQueueWithOnceToken:onceToken
                                                     turboConvertClass:standIn];

  IMP afterSchedule = [self classMethodIMP:standIn selector:selector];
  XCTAssertEqual(before, afterSchedule, @"swizzle must not run synchronously from schedule");

  [self drainMainQueue];

  IMP afterDrain = [self classMethodIMP:standIn selector:selector];
  XCTAssertNotEqual(before, afterDrain, @"swizzle must run once the main queue drains");

  gLastJsonSeenByOriginalIMP = nil;
  [self callConvert:standIn selectorName:kSpecSelector json:[self nullSentinel]];
  XCTAssertEqualObjects(gLastJsonSeenByOriginalIMP, [NSNull null]);
}

- (void)testScheduleSwizzle_secondCallDoesNotDoubleWrap {
  Class standIn = [self makeStandInConvertClass];
  SEL selector = NSSelectorFromString(kSpecSelector);

  dispatch_once_t *onceToken = [self newOnceToken];
  [RNFBNullSentinelInterceptor scheduleSwizzleOnMainQueueWithOnceToken:onceToken
                                                     turboConvertClass:standIn];
  [self drainMainQueue];
  IMP afterFirst = [self classMethodIMP:standIn selector:selector];

  [RNFBNullSentinelInterceptor scheduleSwizzleOnMainQueueWithOnceToken:onceToken
                                                     turboConvertClass:standIn];
  [self drainMainQueue];
  IMP afterSecond = [self classMethodIMP:standIn selector:selector];

  XCTAssertEqual(afterFirst, afterSecond, @"dispatch_once must prevent a second IMP wrap");
}

// Nil arm of `if (cxxConvertClass)`.
// Precondition: the unit host has no React runtime (RNFBAppUnitTests.xcodeproj links no React), so
// RCTCxxConvert is absent. The original missing-case test made the same assumption. The only test
// that registers a global RCTCxxConvert (the "present" test) disposes of it in tearDown, so the
// class is also absent here regardless of which test ran first.
- (void)testSwizzleRCTConvertMethods_missingRCTCxxConvert_isNoOp {
  XCTAssertNil(NSClassFromString(kCxxConvertClassName));
  XCTAssertNoThrow([RNFBNullSentinelInterceptor swizzleRCTConvertMethods]);
}

// Non-nil arm of `if (cxxConvertClass)`. Registers a global RCTCxxConvert stand-in (disposed in
// tearDown). Same no-React-in-the-host precondition as the missing-class test above.
- (void)testSwizzleRCTConvertMethods_whenRCTCxxConvertPresent_swizzlesSpecMethods {
  XCTAssertNil(NSClassFromString(kCxxConvertClassName),
               @"no RCTCxxConvert may exist before this test registers its stand-in");
  Class convertClass = [self registerClassNamed:kCxxConvertClassName
                                  selectorNames:@[ kCxxConvertSpecSelector ]
                                         global:YES];
  XCTAssertNotNil(convertClass);
  if (convertClass == Nil) {
    return;
  }

  SEL selector = NSSelectorFromString(kCxxConvertSpecSelector);
  IMP before = [self classMethodIMP:convertClass selector:selector];
  [RNFBNullSentinelInterceptor swizzleRCTConvertMethods];
  IMP after = [self classMethodIMP:convertClass selector:selector];
  XCTAssertNotEqual(before, after);

  gLastJsonSeenByOriginalIMP = nil;
  id result = [self callConvert:convertClass
                   selectorName:kCxxConvertSpecSelector
                           json:[self nullSentinel]];
  XCTAssertEqualObjects(gLastJsonSeenByOriginalIMP, [NSNull null]);
  XCTAssertEqualObjects(result, [NSNull null]);
}

- (void)testSwizzleTurboModuleConversions_prefixWithoutSpec_leavesIMPUnchanged {
  Class standIn = [self makeStandInConvertClass];
  SEL notASpec = NSSelectorFromString(kNotASpecSelector);
  SEL unrelated = NSSelectorFromString(kUnrelatedSelector);
  IMP notASpecBefore = [self classMethodIMP:standIn selector:notASpec];
  IMP unrelatedBefore = [self classMethodIMP:standIn selector:unrelated];

  [RNFBNullSentinelInterceptor swizzleTurboModuleConversions:standIn];

  XCTAssertEqual(notASpecBefore, [self classMethodIMP:standIn selector:notASpec]);
  XCTAssertEqual(unrelatedBefore, [self classMethodIMP:standIn selector:unrelated]);
}

@end
