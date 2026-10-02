/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Firebase/Firebase.h>

@implementation FIRStackFrame {
  NSString *_symbol;
  NSString *_file;
  uint32_t _line;
}

+ (instancetype)stackFrameWithSymbol:(NSString *)symbol file:(NSString *)file line:(uint32_t)line {
  FIRStackFrame *frame = [[FIRStackFrame alloc] init];
  frame->_symbol = [symbol copy];
  frame->_file = [file copy];
  frame->_line = line;
  return frame;
}

- (NSString *)symbol {
  return _symbol;
}

- (NSString *)file {
  return _file;
}

- (uint32_t)line {
  return _line;
}

@end

@implementation FIRExceptionModel {
  NSString *_name;
  NSString *_reason;
}

+ (instancetype)exceptionModelWithName:(NSString *)name reason:(NSString *)reason {
  FIRExceptionModel *model = [[FIRExceptionModel alloc] init];
  model->_name = [name copy];
  model->_reason = [reason copy];
  return model;
}

- (NSString *)name {
  return _name;
}

- (NSString *)reason {
  return _reason;
}

@end

@implementation FIRCrashlytics

static BOOL sDidCrashDuringPreviousExecutionValue;
static BOOL sCheckForUnsentReportsValue;
static NSMutableArray<NSString *> *sLoggedMessages;
static NSMutableDictionary *sCustomValues;
static NSString *sUserIDValue;
static NSUInteger sDeleteUnsentReportsCallCount;
static NSUInteger sSendUnsentReportsCallCount;
static FIRExceptionModel *sLastRecordedExceptionModel;

+ (void)initialize {
  if (self == [FIRCrashlytics class]) {
    sLoggedMessages = [NSMutableArray new];
    sCustomValues = [NSMutableDictionary new];
  }
}

+ (instancetype)crashlytics {
  static FIRCrashlytics *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[FIRCrashlytics alloc] init];
  });
  return shared;
}

+ (BOOL)didCrashDuringPreviousExecutionValue {
  return sDidCrashDuringPreviousExecutionValue;
}

+ (void)setDidCrashDuringPreviousExecutionValue:(BOOL)didCrashDuringPreviousExecutionValue {
  sDidCrashDuringPreviousExecutionValue = didCrashDuringPreviousExecutionValue;
}

+ (BOOL)checkForUnsentReportsValue {
  return sCheckForUnsentReportsValue;
}

+ (void)setCheckForUnsentReportsValue:(BOOL)checkForUnsentReportsValue {
  sCheckForUnsentReportsValue = checkForUnsentReportsValue;
}

+ (NSArray<NSString *> *)loggedMessages {
  return [sLoggedMessages copy];
}

+ (void)setLoggedMessages:(NSArray<NSString *> *)loggedMessages {
  [sLoggedMessages removeAllObjects];
  if (loggedMessages != nil) {
    [sLoggedMessages addObjectsFromArray:loggedMessages];
  }
}

+ (NSDictionary *)customValues {
  return [sCustomValues copy];
}

+ (void)setCustomValues:(NSDictionary *)customValues {
  [sCustomValues removeAllObjects];
  if (customValues != nil) {
    [sCustomValues addEntriesFromDictionary:customValues];
  }
}

+ (NSString *)userIDValue {
  return sUserIDValue;
}

+ (void)setUserIDValue:(NSString *)userIDValue {
  sUserIDValue = [userIDValue copy];
}

+ (NSUInteger)deleteUnsentReportsCallCount {
  return sDeleteUnsentReportsCallCount;
}

+ (void)setDeleteUnsentReportsCallCount:(NSUInteger)deleteUnsentReportsCallCount {
  sDeleteUnsentReportsCallCount = deleteUnsentReportsCallCount;
}

+ (NSUInteger)sendUnsentReportsCallCount {
  return sSendUnsentReportsCallCount;
}

+ (void)setSendUnsentReportsCallCount:(NSUInteger)sendUnsentReportsCallCount {
  sSendUnsentReportsCallCount = sendUnsentReportsCallCount;
}

+ (FIRExceptionModel *)lastRecordedExceptionModel {
  return sLastRecordedExceptionModel;
}

+ (void)setLastRecordedExceptionModel:(FIRExceptionModel *)lastRecordedExceptionModel {
  sLastRecordedExceptionModel = lastRecordedExceptionModel;
}

+ (void)resetTestState {
  sDidCrashDuringPreviousExecutionValue = NO;
  sCheckForUnsentReportsValue = NO;
  [sLoggedMessages removeAllObjects];
  [sCustomValues removeAllObjects];
  sUserIDValue = nil;
  sDeleteUnsentReportsCallCount = 0;
  sSendUnsentReportsCallCount = 0;
  sLastRecordedExceptionModel = nil;
}

- (void)checkForUnsentReportsWithCompletion:(void (^)(BOOL unsentReports))completion {
  if (completion != nil) {
    completion(sCheckForUnsentReportsValue);
  }
}

- (void)deleteUnsentReports {
  sDeleteUnsentReportsCallCount += 1;
}

- (BOOL)didCrashDuringPreviousExecution {
  return sDidCrashDuringPreviousExecutionValue;
}

- (void)log:(NSString *)message {
  if (message != nil) {
    [sLoggedMessages addObject:message];
  }
}

- (void)sendUnsentReports {
  sSendUnsentReportsCallCount += 1;
}

- (void)setCustomValue:(id)value forKey:(NSString *)key {
  if (key == nil) {
    return;
  }
  if (value == nil) {
    [sCustomValues removeObjectForKey:key];
  } else {
    sCustomValues[key] = value;
  }
}

- (void)setUserID:(NSString *)userID {
  sUserIDValue = [userID copy];
}

- (void)recordExceptionModel:(FIRExceptionModel *)exceptionModel {
  sLastRecordedExceptionModel = exceptionModel;
}

@end
