#import "RCTConvert+UIBackgroundFetchResult.h"

@implementation RCTConvert (UIBackgroundFetchResult)

RCT_ENUM_CONVERTER(
    UIBackgroundFetchResult,
    (@{
        @"backgroundFetchResultNoData" : @(UIBackgroundFetchResultNoData),
        @"backgroundFetchResultNewData" : @(UIBackgroundFetchResultNewData),
        @"backgroundFetchResultFailed" : @(UIBackgroundFetchResultFailed)}
    ),
    UIBackgroundFetchResultNoData,
    integerValue
)

@end
