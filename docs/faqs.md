# FAQs / Troubleshooting

### Comparison to Firestack

Firestack was a great start to integrating Firebase and React Native, however has underlying issues which needed to be fixed.
A V3 fork of Firestack was created to help address issues such as lack of standardisation with the Firebase Web SDK, 
and missing core features (crash reporting, transactions etc). The volume of pull requests with fixes/features soon became
too large to manage on the existing repository, whilst trying to maintain backwards compatibility.

RNFirebase was re-written from the ground up, addressing these issues with core focus being around matching the Web SDK as
closely as possible and fixing the major bugs/issues along the way.

### How do I integrate Redux with RNFirebase

As every project has different requirements & structure, RNFirebase *currently* has no built in methods for Redux integration.
As RNFirebase can be used outside of a Components context, you do have free reign to integrate it as you see fit. For example,
with [`redux-thunk`](https://github.com/gaearon/redux-thunk) you dispatch updates to your store with updates from Firebase:

```javascript
class MyApp extends React.Component {

  componentDidMount() {
    this.props.dispatch(onAuthStateChanged());
  }

  ...
}

connect()(MyApp);
```

```javascript
export function onAuthStateChanged() {
  return (dispatch) => {
    firebase.auth().onAuthStateChanged((user) => {
      dispatch({
        type: 'AUTH_STATE_CHANGE',
        user,
      });
    });
  };
}
```

### [Android] Google Play Services is required to run this application but no valid installation was found

The emulator/device you're using does not have the Play Services SDK installed. 

- Emulator: Open SDK manager, under 'SDK Tools' ensure "Google Play services, rev X" is installed. Once installed, 
create a new emulator image. When selecting your system image, ensure the target comes "with Google APIs".
- Device: Play Services needs to be downloaded from the Google Play Store.


