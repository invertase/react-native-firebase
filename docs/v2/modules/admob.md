# AdMob

The admob allows you to display adverts in your app, using your account from [AdMob by Google](https://www.google.co.uk/admob/). RNFirebase allows you to display Banners, Interstitials, NativeExpress Ads & Rewarded Videos.

## Initialize

Before using any AdMob feature, ensure you call the initialize method. This only needs to be done once per the apps lifecycle.
Initialize takes your AdMob App ID, where you can find on your AdMob dashboard.

> For testing purposes, you can use AdMobs test app ID "ca-app-pub-3940256099942544~3347511713".

```js
firebase.admob().initialize("ca-app-pub-3940256099942544~3347511713");
```

## Debugging

Once initialized, you can debug ((Android)[https://developers.google.com/mobile-ads-sdk/docs/dfp/android/debug]/(iOS)[https://developers.google.com/mobile-ads-sdk/docs/dfp/ios/debug])
your ads using the debug menu.

```js
firebase.admob().openDebugMenu();
```

## API

### Banner

AdMob Banners in RNFirebase are exported as a usable React component, allowing you to integrate it easily into your existing app very easily.

#### Props

| Prop                | Type               | Default                                 | Description                                                                         |
| ------------------- | ------------------ | --------------------------------------- | ----------------------------------------------------------------------------------- |
| size                | string (See Sizes) | SMART_BANNER                            | Returns a sized banner (automatically sets View style)                              |
| unitId              | string             |                                         | Your AdMob banner unit ID.                                                          |
| request             | AdRequest          | new AdRequest().addTestDevice().build() | An instance of AdRequest to load with the Banner                                    |
| onAdLoaded          | function           |                                         | Called when an ad is received.                                                      |
| onAdOpened          | function           |                                         | Called when an ad opens an overlay that covers the screen.                          |
| onAdLeftApplication | function           |                                         | Called when an ad leaves the application (e.g., to go to the browser).              |
| onAdClosed          | function           |                                         | Called when the user is about to return to the application after clicking on an ad. |
| onAdFailedToLoad    | function           |                                         | Called when an ad request failed. See Error Handling                                |

#### Example

```js
const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();
request.addKeyword('foobar');
...
render() {
  return (
    <Banner
      size={"LARGE_BANNER"}
      request={request.build()}
      onAdLoaded={() => {
        console.log('Advert loaded and is now visible');
      }}
    />
  );
}

```

### Interstitial

An interstitial is a full screen advert which creates a new activity on top of React. As they need to be controlled,
allowing the developer to choose when to display them they're not available as a component. Instead they're controlled via
method calls.

A single interstitial instance can only be shown once. If you want to display another, create a new one.

To request an interstitial from AdMob, the `loadAd` method must be called with an instance of `AdRequest` (see below for full API):

#### Methods

| Method              | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| loadAd(AdRequest)   | Loads an advert with request config                                          |
| on(event, callback) | Listens to advert events. See Event Types for more information.              |
| isLoaded()          | Returns a boolean value as to whether the advert is loaded and ready to show.|
| show()              | Show the advert on the device                                                |

#### Example

```js
const advert = firebase.admob().interstitial('ca-app-pub-3940256099942544/1033173712');

const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();
request.addKeyword('foo').addKeyword('bar');

// Load the advert with our AdRequest
advert.loadAd(request.build());

advert.on('onAdLoaded', () => {
  console.log('Advert ready to show.');
});

// Simulate the interstitial being shown "sometime" later during the apps lifecycle
setTimeout(() => {
  if (advert.isLoaded()) {
    advert.show();
  } else {
    // Unable to show interstitial - not loaded yet.
  }
}, 1000);
```

### Native Express

An AdMob Native Express advert is much like a standard Banner, except it can be integrated seamlessly into your app using user predefined
styling (background color, positions, font size etc). Native Express adverts are exported as a usable React component.

#### Props

| Prop                | Type               | Default                                 | Description                                                                         |
| ------------------- | ------------------ | --------------------------------------- | ----------------------------------------------------------------------------------- |
| size                | string (See Sizes) | SMART_BANNER                            | TODO                                                                                |
| unitId              | string             |                                         | Your AdMob banner unit ID.                                                          |
| request             | AdRequest          | new AdRequest().addTestDevice().build() | An instance of AdRequest to load with the Banner                                    |
| video               | AdRequest          | new VideoOptions().build()              | An instance of AdRequest to load with the Banner                                    |
| onAdLoaded          | function           |                                         | Called when an ad is received.                                                      |
| onAdOpened          | function           |                                         | Called when an ad opens an overlay that covers the screen.                          |
| onAdLeftApplication | function           |                                         | Called when an ad leaves the application (e.g., to go to the browser).              |
| onAdClosed          | function           |                                         | Called when the user is about to return to the application after clicking on an ad. |
| onAdFailedToLoad    | function           |                                         | Called when an ad request failed. See Event PropTypes for more information.         |
| onVideoEnd          | function           |                                         | Called if the advert video has ended (only called if the advert has a video).       |

#### Usage

```js
const Banner = firebase.admob.Banner;
const NativeExpress = firebase.admob.NativeExpress;
const AdRequest = firebase.admob.AdRequest;

const request = new AdRequest();
request.addKeyword('foobar');
...
render() {
  return (
    <NativeExpress
      size={"300x400"}
      request={request.build()}
      onAdLoaded={() => {
        console.log('Advert loaded and is now visible');
      }}
    />
  );
}

```

### Rewarded Video

A rewarded video allows you to display a video to a user, whereby they're able to watch it to gain "rewards", or skip it
and receive nothing. For example, when a user completes a level on your gaming app, show them a video which will give them in-game
credit.

A single rewarded video instance can only be shown once. If you want to display another, create a new one.

?> It's recommended you begin loading the video as soon as possible.

To request an Rewarded Video from AdMob, the `loadAd` method must be called with an instance of `AdRequest` (see below for full API):

#### Methods

| Method              | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| loadAd(AdRequest)   | Loads an advert with request config                                          |
| on(event, callback) | Listens to advert events. See Event Types                                    |
| isLoaded()          | Returns a boolean value as to whether the advert is loaded and ready to show |
| show()              | Show the advert on the device                                                |

#### Example

```js
const advert = firebase.admob().rewarded('ca-app-pub-3940256099942544/1033173712');

const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();
request.addKeyword('foo').addKeyword('bar');

// Load the advert with our AdRequest
advert.loadAd(request.build());

advert.on('onAdLoaded', () => {
  console.log('Advert ready to show.');
});

advert.on('onRewarded', (event) => {
  console.log('The user watched the entire video and will now be rewarded!', event);
});

...

onLevelComplete()
  .then(() => {
    if (advert.isLoaded()) {
      advert.show();
    } else {
      // skip...
    }
  });
```

### AdRequest

The AdRequest class is used to create an object to be passed to each advert request. The request is handled on AdMob,
and returns adverts tailored to the request options provided.

!> If no AdRequest is sent, the default request calls `addTestDevice`. Therefore, ensure a custom AdRequest object is passed through
in production.

##### build()
Builds the current request for AdMob to handle.

##### addTestDevice(device?: string)
Sets a device ID as a test device. If no device string is passed, a default emulator id is passed.

##### addKeyword(keyword: `string`)
Add a new keyword to relate the advert to.

##### setBirthday(date: `Date`)
Sets the user's birthday for targeting purposes.

##### setGender(gender: `male | female | unknown`)
Sets the user's gender for targeting purposes.

##### setLocation()
Sets the user's location for targeting purposes.

##### setRequestAgent(requestAgent: `string`)
Sets the request agent string to identify the ad request's origin. Third party libraries that reference the Mobile Ads SDK should call this method to denote the platform from which the ad request originated. For example, if a third party ad network called "CoolAds network" mediates requests to the Mobile Ads SDK, it should call this method with "CoolAds"

##### setContentUrl(url: `string`)
Sets the content URL for targeting purposes.

##### [android] setIsDesignedForFamilies(forFamilies: `boolean`)
If you set this value to true, you indicate that your app requires that the ad request should return a Designed for Families-compliant ad.

If you set this value to false, you indicate that your app does not require that the ad request should return a Designed for Families-compliant ad.

##### tagForChildDirectedTreatment(forChildren: `boolean`)

### VideoOptions

The VideoOptions class is used to create an object to be passed through to each advert request. If the advert returns a video,
the options are used when displaying it on the application.

?> Currently `NativeExpress` only accepts VideoOptions. If no VideoOptions are sent, the default options call `setStartMuted(true)`.

##### build()
Builds the current options for AdMob to handle.

##### setStartMuted(muted: `boolean`)
If true, any returned video will not play sound when it starts. The end user can manually enable sound on the advert interface.

## Prop Types

##### size: `String`
Sets the size of an Advert. Can be one of the following or a custom size:

| Size              | Description                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| BANNER            | Mobile Marketing Association (MMA) banner ad size (320x50 density-independent pixels).                 |
| FULL_BANNER       | Interactive Advertising Bureau (IAB) full banner ad size (468x60 density-independent pixels).          |
| LARGE_BANNER      | Large banner ad size (320x100 density-independent pixels).                                             |
| LEADERBOARD       | Interactive Advertising Bureau (IAB) leaderboard ad size (728x90 density-independent pixels).          |
| MEDIUM_RECTANGLE  | Interactive Advertising Bureau (IAB) medium rectangle ad size (300x250 density-independent pixels).    |
| SMART_BANNER      | A dynamically sized banner that is full-width and auto-height.                                         |

To specify a custom size, pass a string with the width and height split by an "x" (follows the Regex pattern `([0-9]+)x([0-9]+)`), e.g 320x150

?> Requesting an advert with a size which does not exist on the AdMob servers will return `admob/error-code-internal-error`.

##### unitId: `String`
The unit ID for the banner. Defaults to the testing unitId provided by Google for the advert type.

##### request: `AdRequest`
A built AdRequest object returned from `AdRequest.build()`.

##### video: `VideoOptions`
A built VideoOptions object returned from `VideoOptions.build()`.

### Events
Every advert returns common event types. On component based adverts (e.g. Banner) they're available as props and on instance based
adverts (e.g. Interstitial) they're available via the `on` method.

##### onAdLoaded(config: `Object`)
!> The config is not provided for Interstitial or Rewarded Video adverts.

On successful response from the AdMob servers. This is also called when a new banner is automatically loaded from the AdMob servers if the current one expires.

Returns an object of config data related to the loaded advert:
```js
{
  hasVideoContent: boolean,
  width: number,
  height: number,
}
```

##### onAdOpened()
Called when the user presses the advert and it successfully opens.

##### onAdLeftApplication()
Called if the opened advert causes the user to leave the application, for example opening a URL in the browser.

##### onAdClosed()
Called when the user returns back to the application after closing an advert.

##### onAdFailedToLoad(error: `Error`)
Called when an advert fails to load. Returns a JavaScript Error with one of the following error codes.

| code                              | message                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| admob/error-code-internal-error   | Something happened internally; for instance, an invalid response was received from the ad server.            |
| admob/error-code-invalid-request  | The ad request was invalid; for instance, the ad unit ID was incorrect.                                      |
| admob/error-code-network-error    | The ad request was unsuccessful due to network connectivity.                                                 |
| admob/error-code-no-fill          | The ad request was successful, but no ad was returned due to lack of ad inventory.                           |
| admob/os-version-too-low          | The current device’s OS is below the minimum required version.                                               |

##### [NativeExpress] onVideoEnd()
Called when video playback finishes playing.

##### [NativeExpress] onVideoMute(config: `Object`)
Called when the video changes mute state.

```js
{
  isMuted: boolean,
}
```

##### [NativeExpress] onVideoPause()
Called when video playback is paused.

##### [NativeExpress] onVideoPlay()
Called when video playback is playing.

##### [NativeExpress] onVideoStart()
alled when video playback first begins.

##### [RewardedVideo] onRewarded(reward: `Object`)
Called when the user has been rewarded (usually for watching an entire video). Returns a reward object:

```js
{
  type: string,
  amount: number,
}
```

##### [RewardedVideo] onRewardedVideoStarted()
Called when a rewarded video has started to play.

## Statics
The following statics are available on the `firebase.admob` instance.

### Banner
Exports a React component to display an AdMob Banner.

### NativeExpress
Exports a React component to display an AdMob Native Express advert.

### AdRequest
Used to build a request object to pass into AdMob requests.

### VideoOptions
Used to build an options object for how videos should be handled with adverts containing a video.

### EventTypes
Returns all of the available advert event types.

### RewardedVideoEventTypes
Returns the extra event types for Rewarded Videos.

### NativeExpressEventTypes
Returns the extra event types for Native Express adverts.

