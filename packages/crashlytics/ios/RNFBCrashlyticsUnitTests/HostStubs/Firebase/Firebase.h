/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Enough of Firebase Crashlytics for compiling RNFBCrashlyticsHelper.m
 * and asserting SDK call wiring without linking the real SDK.
 */
#import <Foundation/Foundation.h>

@interface FIRStackFrame : NSObject
@property(nonatomic, readonly, copy) NSString *symbol;
@property(nonatomic, readonly, copy) NSString *file;
@property(nonatomic, readonly, assign) uint32_t line;
+ (instancetype)stackFrameWithSymbol:(NSString *)symbol file:(NSString *)file line:(uint32_t)line;
@end

@interface FIRExceptionModel : NSObject
@property(nonatomic, readonly, copy) NSString *name;
@property(nonatomic, readonly, copy) NSString *reason;
@property(nonatomic, copy, nullable) NSArray<FIRStackFrame *> *stackTrace;
+ (instancetype)exceptionModelWithName:(NSString *)name reason:(NSString *)reason;
@end

@interface FIRCrashlytics : NSObject

+ (instancetype)crashlytics;

- (void)checkForUnsentReportsWithCompletion:(void (^)(BOOL unsentReports))completion;
- (void)deleteUnsentReports;
- (BOOL)didCrashDuringPreviousExecution;
- (void)log:(NSString *)message;
- (void)sendUnsentReports;
- (void)setCustomValue:(nullable id)value forKey:(NSString *)key;
- (void)setUserID:(NSString *)userID;
- (void)recordExceptionModel:(FIRExceptionModel *)exceptionModel;

/** Test seams */
@property(class, nonatomic, assign) BOOL didCrashDuringPreviousExecutionValue;
@property(class, nonatomic, assign) BOOL checkForUnsentReportsValue;
@property(class, nonatomic, copy, nullable) NSArray<NSString *> *loggedMessages;
@property(class, nonatomic, copy, nullable) NSDictionary *customValues;
@property(class, nonatomic, copy, nullable) NSString *userIDValue;
@property(class, nonatomic, assign) NSUInteger deleteUnsentReportsCallCount;
@property(class, nonatomic, assign) NSUInteger sendUnsentReportsCallCount;
@property(class, nonatomic, copy, nullable) FIRExceptionModel *lastRecordedExceptionModel;

+ (void)resetTestState;

@end
