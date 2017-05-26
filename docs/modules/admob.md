# AdMob

The admob allows you to display adverts in your app, using your account from [AdMob by Google](https://www.google.co.uk/admob/).

RNFirebase allows you to display Banners, Interstitials, Native Ads & Rewarded Videos.

### Banner

AdMob Banners in RNFirebase are exported as a usable React component, allowing you to integrate it easily into your existing app very easily.

```js
const Banner = firebase.admob.Banner;
...
render() {
  return (
    <Banner

    />
  );
}

```

### Interstitial

An interstitial is a full screen advert which creates a new activity on top of React. As they need to be controlled,
allowing the developer to choose when to display them they're not available as a component. Instead they're controlled via
method calls.

To request an interstitial from AdMob, the `loadAd` method must be called with an instance of `AdRequest` (see below for full API):

```js
const advert = firebase.admob().interstitial('ca-app-pub-3940256099942544/1033173712');

const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();
request.addKeyword('foo').addKeyword('bar');

// Load the advert with our AdRequest
advert.loadAd(request.build());

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

## Statics

### Banner
> Accessed via `firebase.admob.Banner`.

Exports a React component with the following PropTypes:


### AdRequest
> Accessed via `firebase.admob.AdRequest`.

Used to build a request object to pass into AdMob requests. Exposes the following chainable methods:

