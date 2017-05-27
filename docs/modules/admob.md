# AdMob

The admob allows you to display adverts in your app, using your account from [AdMob by Google](https://www.google.co.uk/admob/).

RNFirebase allows you to display Banners, Interstitials, Native Ads & Rewarded Videos.

### Banner

AdMob Banners in RNFirebase are exported as a usable React component, allowing you to integrate it easily into your existing app very easily.

#### Props

| Prop                | Type               | Default                                | Description                                                                         |
| ------------------- | ------------------ | -------------------------------------- | ----------------------------------------------------------------------------------- |
| size                | string (See Sizes) | SMART_BANNER                           | Returns a sized banner (automatically sets View style)                              |
| unitId              | string             | ca-app-pub-3940256099942544/6300978111 | Your AdMob banner unit ID. Default is the Google testing account                    |
| testing             | boolean            | true                                   | Whether the current device ID should be assigned as a test device                   |
| onAdLoaded          | function           |                                        | Called when an ad is received.                                                      |
| onAdOpened          | function           |                                        | Called when an ad opens an overlay that covers the screen.                          |
| onAdLeftApplication | function           |                                        | Called when an ad leaves the application (e.g., to go to the browser).              |
| onAdClosed          | function           |                                        | Called when the user is about to return to the application after clicking on an ad. |
| onAdFailedToLoad    | function           |                                        | Called when an ad request failed. See Error Handling                                |

?> See Event Types for more information.

#### Example

```js
const Banner = firebase.admob.Banner;
...
render() {
  return (
    <Banner
      size={"LARGE_BANNER"}
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

To request an interstitial from AdMob, the `loadAd` method must be called with an instance of `AdRequest` (see below for full API):

#### Methods

| Method              | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| loadAd(AdRequest)   | Loads an advert with request config                                          |
| on(event, callback) | Listens to advert events. See Event Types                                    |
| isLoaded()          | Returns a boolean value as to whether the advert is loaded and ready to show |
| show()              | Show the advert on the device                                                |

?> See Event Types for more information.

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

### Native

### Rewarded Video

A rewarded video allows you to display a video to a user, whereby they're able to watch it to gain "rewards", or skip it
and receive nothing. For example, when a user completes a level on your gaming app, show them a video which will give them in-game
credit.

?> It's recommended you begin loading the video as soon as possible.

To request an Rewarded Video from AdMob, the `loadAd` method must be called with an instance of `AdRequest` (see below for full API):

#### Methods

| Method              | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| loadAd(AdRequest)   | Loads an advert with request config                                          |
| on(event, callback) | Listens to advert events. See Event Types                                    |
| isLoaded()          | Returns a boolean value as to whether the advert is loaded and ready to show |
| show()              | Show the advert on the device                                                |

?> See Event Types for more information.

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

    }
  });
```

### AdRequest

##### addTestDevice()
Sets the current device as a test device.

##### addKeyword(keyword: string)
Add a new keyword to relate the advert to.

##### setBirthday(date: Date)

##### setGender()

##### setLocation()

##### setRequestAgent()

##### setIsDesignedForFamilies(forFamilies: boolean)

##### tagForChildDirectedTreatment(forChildren: boolean)

## Statics

The following statics are available on the `firebase.admob` instance.

### Banner

Exports a React component to display an AdMob Banner.

### AdRequest

Used to build a request object to pass into AdMob requests.

