import { getApp } from '@react-native-firebase/app';
import {
  getDatabase,
  connectDatabaseEmulator,
  goOffline,
  goOnline,
  ref,
  refFromURL,
  setPersistenceEnabled,
  setLoggingEnabled,
  setPersistenceCacheSizeBytes,
  getServerTime,
  serverTimestamp,
  increment,
  onValue,
  runTransaction,
  SDK_VERSION,
  type Database,
  type DatabaseReference,
} from '.';

const db = getDatabase();
console.log(db.app.name);

const dbWithApp = getDatabase(getApp());
console.log(dbWithApp.app.name);

connectDatabaseEmulator(db, 'localhost', 9000);
goOffline(db);
goOnline(db);

const dbRef: DatabaseReference = ref(db, 'path');
console.log(dbRef.key);

refFromURL(db, 'https://example.firebaseio.com/path');
setPersistenceEnabled(db, true);
setLoggingEnabled(db, true);
setPersistenceCacheSizeBytes(db, 1048576);
console.log(getServerTime(db));
console.log(serverTimestamp());
console.log(increment(1));

onValue(dbRef, snapshot => {
  console.log(snapshot.val());
});

runTransaction(dbRef, current => current).then(result => {
  console.log(result.committed);
});

const typedDb: Database = db;
console.log(typedDb.app.name);
console.log(SDK_VERSION);
