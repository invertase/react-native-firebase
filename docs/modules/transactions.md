# Transactions

?> For help on how to use firebase transactions please see the [Firebase Transaction Documentation](https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction).

### Android Implementation

The [android implementation](https://github.com/invertase/react-native-firebase/blob/master/android/src/main/java/io/invertase/firebase/database/RNFirebaseTransactionHandler.java) makes use of [Condition](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/locks/Condition.html) and [ReentrantLock](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/locks/ReentrantLock.html) locks to handle transactions across the React Native Bridge. 


### iOS Implementation

The [iOS implementation](https://github.com/invertase/react-native-firebase/blob/master/ios/RNFirebase/RNFirebaseDatabase.m#L279) makes use of GCD (Grand Central Dispatch) to handle transactions across the React Native Bridge without blocking the application thread. Check out [this](https://mikeash.com/pyblog/friday-qa-2011-10-14-whats-new-in-gcd.html) post for some 'light' reading about it.

!> Transactions that receive no response from react native's JS thread within 30 seconds are automatically aborted - this value is currently not configurable - PR welcome.


## Example

```javascript
const ref = firebase.database().ref('user/posts');

ref.transaction((posts) => {
  return (posts || 0) + 1;
}, (error, committed, snapshot) => {
  if (error) {
    console.log('Something went wrong', error);
  } else if (!committed) {
    console.log('Aborted'); // Returning undefined will trigger this
  } else {
    console.log('User posts incremented by 1');
  }

  console.log('User posts is now: ', snapshot.val());
});
```
