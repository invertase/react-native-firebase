#import "RNFirebasePerformance.h"

#if __has_include(<FirebasePerformance/FIRPerformance.h>)
#import <FirebasePerformance/FIRPerformance.h>
@implementation RNFirebasePerformance
RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        _traces = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (FIRTrace *)getOrCreateTrace:(NSString *)identifier {
    if (_traces[identifier]) {
        return _traces[identifier];
    }
    FIRTrace *trace = [[FIRPerformance sharedInstance] traceWithName:identifier];
    _traces[identifier] = trace;
    return trace;
}

RCT_EXPORT_METHOD(setPerformanceCollectionEnabled:
    (BOOL *) enabled) {
    [FIRPerformance sharedInstance].dataCollectionEnabled = (BOOL) enabled;
}

RCT_EXPORT_METHOD(start:
    (NSString *) identifier) {
    [[self getOrCreateTrace:identifier] start];
}

RCT_EXPORT_METHOD(stop:
    (NSString *) identifier) {
    [[self getOrCreateTrace:identifier] stop];
    _traces[identifier] = nil;
}

RCT_EXPORT_METHOD(incrementCounter:
    (NSString *) identifier
            event:
            (NSString *) event) {
    [[self getOrCreateTrace:identifier] incrementCounterNamed:event];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation RNFirebasePerformance
@end
#endif
