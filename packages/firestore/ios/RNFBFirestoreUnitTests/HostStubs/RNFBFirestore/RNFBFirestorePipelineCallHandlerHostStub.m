/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBFirestore/RNFBFirestorePipelineCallHandlerHostStub.h"

#import <Firebase/Firebase.h>

@implementation RNFBFirestorePipelineCallHandler

static NSDictionary *sCompletionResult;
static NSDictionary *sCompletionError;
static NSDictionary *sLastPipeline;
static NSDictionary *sLastOptions;

+ (NSDictionary *)completionResult {
  return sCompletionResult;
}
+ (void)setCompletionResult:(NSDictionary *)completionResult {
  sCompletionResult = [completionResult copy];
}
+ (NSDictionary *)completionError {
  return sCompletionError;
}
+ (void)setCompletionError:(NSDictionary *)completionError {
  sCompletionError = [completionError copy];
}
+ (NSDictionary *)lastPipeline {
  return sLastPipeline;
}
+ (void)setLastPipeline:(NSDictionary *)lastPipeline {
  sLastPipeline = [lastPipeline copy];
}
+ (NSDictionary *)lastOptions {
  return sLastOptions;
}
+ (void)setLastOptions:(NSDictionary *)lastOptions {
  sLastOptions = [lastOptions copy];
}
+ (void)resetTestState {
  sCompletionResult = nil;
  sCompletionError = nil;
  sLastPipeline = nil;
  sLastOptions = nil;
}

- (void)executeWithFirestore:(FIRFirestore *)firestore
                    pipeline:(NSDictionary *)pipeline
                     options:(NSDictionary *)options
                  completion:(void (^)(NSDictionary *, NSDictionary *))completion {
  (void)firestore;
  sLastPipeline = [pipeline copy];
  sLastOptions = [options copy];
  if (completion) {
    completion(sCompletionResult, sCompletionError);
  }
}

@end
