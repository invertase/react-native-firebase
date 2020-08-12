---
title: Displaying Ads
description: Learn how to display Interstitial, Rewarded & Banner adverts inside of your React Native application.
next: /admob/european-user-consent
previous: /admob/usage
---

The AdMob package allows you to display three types of adverts; Interstitial, Rewarded & Banner.

## Interstitial Ads

Interstitials are full-screen ads that cover the interface of an app until closed by the user. These type of ads are
programmatically loaded and then shown at a suitable point during your application flow (e.g. after a level on a gaming
app has been completed, or game over). The ads can be preloaded in the background to ensure they're ready to go when needed.

To create a new interstitial, call the `createForAdRequest` method from the `InterstitialAd` class. The first argument
of the method is the "Ad Unit ID". For testing, we can use a Test ID, however for production the ID from the
Google AdMob dashboard under "Ad units" should be used:

```js
import { InterstitialAd, TestIds, AdEventType } from '@react-native-firebase/admob';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});
```

The second argument is additional optional request options object to be sent whilst loading an advert, such as keywords & location.
Setting additional request options helps AdMob choose better tailored ads from the network. View the [`RequestOptions`](/reference/admob/requestoptions)
documentation to view the full range of options available.

The call to `createForAdRequest` returns an instance of the [`InterstitialAd`](/reference/admob/interstitialad) class,
which provides a number of utilities for loading and displaying interstitials.

To listen to events, such as when the advert from the network has loaded or when an error occurs, we can subscribe via the
`onAdEvent` method:

```jsx
import React, { useEffect, useState } from 'react';
import { Button } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from '@react-native-firebase/admob';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const eventListener = interstitial.onAdEvent(type => {
      if (type === AdEventType.LOADED) {
        setLoaded(true);
      }
    });

    // Start loading the interstitial straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      eventListener();
    };
  }, []);

  // No advert ready to show yet
  if (!loaded) {
    return null;
  }

  return (
    <Button
      title="Show Interstitial"
      onPress={() => {
        interstitial.show();
      }}
    />
  );
}
```

The code above subscribes to the interstitial events (via `onAdEvent()`) and immediately starts to load a new advert from
the network (via `load()`). Once an advert is available, local state is set, re-rendering the component showing a `Button`.
When pressed, the `show` method on the interstitial instance is called and the advert is shown over-the-top of your
application.

The `onAdEvent` listener also triggers when events inside of the application occur, such as if the user clicks the advert,
or closes the advert and returns back to your app. To view a full list of events which are available, view the
[`AdEventType`](/reference/admob/adeventtype) documentation.

If needed, you can reuse the existing instance of the `InterstitialAd` class to load more adverts and show them when required.

## Rewarded Ads

Rewarded Ads are full-screen ads that cover the interface of an app until closed by the user. The content of a rewarded
advert is controlled via the Google AdMob dashboard.

The purpose of a rewarded ad is to reward users with _something_ after completing an action inside of the advert, such
as watching a video or submitting an option via an interactive form. If the user completes the action, you can reward them
with something (e.g. in-game currency).

To create a new interstitial, call the `createForAdRequest` method from the `RewardedAd` class. The first argument
of the method is the "Ad Unit ID". For testing, we can use a Test ID, however for production the ID from the
Google AdMob dashboard under "Ad units" should be used:

```js
import { RewardedAd, TestIds } from '@react-native-firebase/admob';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});
```

The second argument is additional optional request options object to be sent whilst loading an advert, such as keywords & location.
Setting additional request options helps AdMob choose better tailored ads from the network. View the [`RequestOptions`](/reference/admob/requestoptions)
documentation to view the full range of options available.

The call to `createForAdRequest` returns an instance of the [`RewardedAd`](/reference/admob/rewardedad) class,
which provides a number of utilities for loading and displaying rewarded ads.

To listen to events, such as when the advert from the network has loaded or when an error occurs, we can subscribe via the
`onAdEvent` method:

```js
import React, { useEffect, useState } from 'react';
import { Button } from 'react-native';
import { RewardedAd, RewardedAdEventType, TestIds } from '@react-native-firebase/admob';

const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const eventListener = rewarded.onAdEvent((type, error, reward) => {
      if (type === RewardedAdEventType.LOADED) {
        setLoaded(true);
      }

      if (type === RewardedAdEventType.EARNED_REWARD) {
        console.log('User earned reward of ', reward);
      }
    });

    // Start loading the rewarded ad straight away
    rewarded.load();

    // Unsubscribe from events on unmount
    return () => {
      eventListener();
    };
  }, []);

  // No advert ready to show yet
  if (!loaded) {
    return null;
  }

  return (
    <Button
      title="Show Rewarded Ad"
      onPress={() => {
        rewarded.show();
      }}
    />
  );
}
```

The code above subscribes to the rewarded ad events (via `onAdEvent()`) and immediately starts to load a new advert from
the network (via `load()`). Once an advert is available, local state is set, re-rendering the component showing a `Button`.
When pressed, the `show` method on the rewarded ad instance is called and the advert is shown over-the-top of your
application.

Like Interstitial Ads, the events returns from the `onAdEvent` listener trigger when the user clicks the advert or closes
the advert and returns back to your app. However, an extra `EARNED_REWARD` event can be triggered if the user completes the
advert action. An additional `reward` property is sent with the event, containing the amount and type of rewarded (specified via the dashboard).
An additional `reward` property is sent with the event, containing the amount and type of rewarded (specified via the dashboard).

To learn more, view the [`RewardedAdEventType`](/reference/admob/rewardedadeventtype) documentation.

If needed, you can reuse the existing instance of the `RewardedAd` class to load more adverts and show them when required.

## Banner Ads

Banner ads are partial adverts which can be integrated within your existing application. Unlike Interstitial and Rewarded Ads,
a Banner only takes up a limited area of the application and displays an advert within the area. This allows you to integrate
adverts without a disruptive action.

The module exposes a [`BannerAd`](/reference/admob/bannerad) component. The `unitId` and `size` props are required to display
a banner:

```js
import React from 'react';
import { BannerAd, BannerAdSize, TestIds } from '@react-native-firebase/admob';

const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';

function App() {
  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.FULL_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
}
```

The `size` prop takes a [`BannerAdSize`](/reference/admob/banneradsize) type, and once the advert is available, will
fill the space for the chosen size.

> If no inventory for the size specified is available, an error will be thrown via `onAdFailedToLoad`!

The `requestOptions` prop is additional optional request options object to be sent whilst loading an advert, such as keywords & location.
Setting additional request options helps AdMob choose better tailored ads from the network. View the [`RequestOptions`](/reference/admob/requestoptions)
documentation to view the full range of options available.

The component also exposes props for listening to events, which you can use to handle the state of your app is the user
or network triggers an event:

- `onAdClosed`
- `onAdFailedToLoad`
- `onAdLeftApplication`
- `onAdOpened`

Each render of the component loads a single advert, allowing you to display multiple adverts at once. If you need to reload/change
an advert for a currently mounted component, you'll need to force a re-render inside of your own code.
