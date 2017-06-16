#import <React/RCTComponent.h>
#import <React/RCTBridgeModule.h>

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

#import "GoogleMobileAds/GADNativeExpressAdView.h"
#import "GoogleMobileAds/GADVideoControllerDelegate.h"

@interface NativeExpressComponent : UIView <GADNativeExpressAdViewDelegate, GADVideoControllerDelegate>

@property GADNativeExpressAdView *banner;
//@property(nonatomic, weak) IBOutlet GADNativeExpressAdView *banner;
@property (nonatomic, assign) BOOL requested;

@property (nonatomic, copy) NSString *size;
@property (nonatomic, copy) NSString *unitId;
@property (nonatomic, copy) NSDictionary *request;
@property (nonatomic, copy) NSDictionary *video;

@property (nonatomic, copy) RCTBubblingEventBlock onBannerEvent;

- (void)requestAd;

@end
#else

@interface NativeExpressComponent : NSObject <RCTBridgeModule> {
}
@end

#endif
