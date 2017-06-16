#import <React/RCTComponent.h>
#import <React/RCTBridgeModule.h>

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

#import "GoogleMobileAds/GADBannerView.h"

@interface BannerComponent : UIView <GADBannerViewDelegate>

@property GADBannerView  *banner;

@property (nonatomic, copy) NSString *size;
@property (nonatomic, copy) NSString *unitId;
@property (nonatomic, copy) NSDictionary *request;

@property (nonatomic, copy) RCTBubblingEventBlock onBannerEvent;

- (void)requestAd;

@end
#else

@interface RNFirebaseAdMobBanner : NSObject <RCTBridgeModule> {
}
@end

#endif
