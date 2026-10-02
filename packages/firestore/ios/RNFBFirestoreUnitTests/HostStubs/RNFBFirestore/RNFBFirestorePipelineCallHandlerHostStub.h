/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Satisfies CollectionModuleHelper's Swift-import fallback path.
 */
#import <Foundation/Foundation.h>

@class FIRFirestore;

NS_ASSUME_NONNULL_BEGIN

@interface RNFBFirestorePipelineCallHandler : NSObject

@property(class, nonatomic, strong, nullable) NSDictionary *completionResult;
@property(class, nonatomic, strong, nullable) NSDictionary *completionError;
@property(class, nonatomic, strong, nullable) NSDictionary *lastPipeline;
@property(class, nonatomic, strong, nullable) NSDictionary *lastOptions;
+ (void)resetTestState;

- (void)executeWithFirestore:(FIRFirestore *)firestore
                    pipeline:(nullable NSDictionary *)pipeline
                     options:(nullable NSDictionary *)options
                  completion:(void (^)(NSDictionary *_Nullable result,
                                       NSDictionary *_Nullable error))completion;

@end

NS_ASSUME_NONNULL_END
