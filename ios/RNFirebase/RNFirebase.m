#import "RNFirebase.h"
#import "RNFirebaseEvents.h"

static dispatch_once_t onceToken;

@implementation RNFirebase
RCT_EXPORT_MODULE(RNFirebase);


- (void)dealloc {
    NSLog(@"Dealloc called on RNFirebase: %@", self);
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebase instance");
        [RNFirebase initializeRNFirebase];
    }
    return self;
}

+ (void)initializeRNFirebase {
#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
    dispatch_once(&onceToken, ^{
        [[NSNotificationCenter defaultCenter] postNotificationName:kRNFirebaseInitialized object:nil];
    });
#endif
}

- (NSArray<NSString *> *)supportedEvents {
    return @[INITIALIZED_EVENT];
}

@end