# Transactions

> Transactions are currently an experimental feature as they can not be integrated as easily as the other Firebase features. Please see the [Firebase documentation](https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction) for full implemtation details.

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
