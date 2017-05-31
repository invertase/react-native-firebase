#import "RNFirebase.h"

@implementation RNFirebase
RCT_EXPORT_MODULE(RNFirebase);

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebase instance");
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

@end
