import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  Bytes,
  CACHE_SIZE_UNLIMITED,
  Filter,
  GeoPoint,
  SDK_VERSION,
  Timestamp,
  addDoc,
  and,
  arrayRemove,
  arrayUnion,
  average,
  clearIndexedDbPersistence,
  clearPersistence,
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  count,
  deleteAllPersistentCacheIndexes,
  deleteDoc,
  deleteField,
  disableNetwork,
  disablePersistentCacheIndexAutoCreation,
  doc,
  documentId,
  enableNetwork,
  enablePersistentCacheIndexAutoCreation,
  endAt,
  endBefore,
  getAggregateFromServer,
  getCountFromServer,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  getFirestore,
  getPersistentCacheIndexManager,
  increment,
  initializeFirestore,
  limit,
  limitToLast,
  loadBundle,
  namedQuery,
  onSnapshot,
  onSnapshotsInSync,
  or,
  orderBy,
  query,
  queryEqual,
  refEqual,
  runTransaction,
  serverTimestamp,
  setDoc,
  setLogLevel,
  snapshotEqual,
  startAfter,
  startAt,
  sum,
  terminate,
  updateDoc,
  vector,
  waitForPendingWrites,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type Unsubscribe,
} from '@react-native-firebase/firestore';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { TextField } from '../src/TextField';
import { theme } from '../src/theme';

/** Same host mapping as `packages/app/e2e/helpers.js` `getE2eEmulatorHost`. */
function getFirestoreEmulatorHost(): string {
  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
}

/** Default Firestore port from `.github/workflows/scripts/firebase.emulator.template.json`. */
const FIRESTORE_EMULATOR_PORT = 8080;

const USERS_COLLECTION = 'expo-users';

let emulatorConnected = false;

function ensureFirestoreEmulator(): void {
  if (emulatorConnected) {
    return;
  }
  connectFirestoreEmulator(getFirestore(), getFirestoreEmulatorHost(), FIRESTORE_EMULATOR_PORT);
  emulatorConnected = true;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function FirestoreScreen() {
  const [title, setTitle] = useState('Ada Lovelace');
  const [docId, setDocId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unsubscribers = useRef<Unsubscribe[]>([]);

  const db = useMemo(() => getFirestore(), []);
  const usersCol = useMemo(() => collection(db, USERS_COLLECTION), [db]);

  useEffect(() => {
    // Connect before registering any listener (same order as the database screen).
    ensureFirestoreEmulator();
    const unsubscribe = onSnapshot(usersCol, snapshot => {
      setDocId(current => current ?? snapshot.docs[0]?.id ?? null);
    });
    return () => {
      unsubscribe();
      for (const stop of unsubscribers.current) {
        stop();
      }
      unsubscribers.current = [];
    };
  }, [usersCol]);

  function showResult(message: string) {
    setError(null);
    setResult(message);
  }

  function showError(e: unknown) {
    setResult(null);
    setError(errorMessage(e));
  }

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    try {
      ensureFirestoreEmulator();
      const value = await action();
      showResult(
        typeof value === 'string'
          ? value
          : `${label}: ok${value === undefined ? '' : ` → ${JSON.stringify(value)}`}`,
      );
    } catch (e) {
      showError(e);
    }
  }

  function selectedDocRef() {
    if (!docId) {
      throw new Error('Create or select a document first (use addDoc / setDoc).');
    }
    return doc(usersCol, docId);
  }

  function trackUnsubscribe(stop: Unsubscribe) {
    unsubscribers.current.push(stop);
  }

  return (
    <ScreenChrome title="firestore" result={result} error={error}>
      <Text style={styles.hint}>
        Connects to the Cloud Firestore emulator at {getFirestoreEmulatorHost()}:
        {FIRESTORE_EMULATOR_PORT} before listeners (same host mapping as the e2e helpers; CI default
        port 8080).
      </Text>

      <TextField
        placeholder="Document name / title"
        value={title}
        onChangeText={setTitle}
        autoCapitalize="sentences"
      />
      <Text style={styles.subtle}>Selected doc: {docId ?? '(none)'}</Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getFirestore"
        onPress={() => run('getFirestore', () => Boolean(getFirestore(getApp())))}
      />
      <AppButton
        title="connectFirestoreEmulator"
        onPress={() =>
          run('connectFirestoreEmulator', () => {
            ensureFirestoreEmulator();
            return `${getFirestoreEmulatorHost()}:${FIRESTORE_EMULATOR_PORT}`;
          })
        }
      />
      <AppButton
        title="CACHE_SIZE_UNLIMITED"
        onPress={() => run('CACHE_SIZE_UNLIMITED', () => CACHE_SIZE_UNLIMITED)}
      />
      <AppButton
        title="initializeFirestore (may throw if already started)"
        variant="secondary"
        onPress={() =>
          run('initializeFirestore', () => {
            // WARNING: throws if Firestore was already started for this app/database.
            const instance = initializeFirestore(getApp(), {
              persistence: true,
              cacheSizeBytes: CACHE_SIZE_UNLIMITED,
            });
            return Boolean(instance);
          })
        }
      />
      <Text style={styles.warning}>
        Warning: `initializeFirestore` must run before other Firestore use for that app/database. It
        can throw if `getFirestore` already created the instance.
      </Text>
      <AppButton
        title="setLogLevel('error')"
        onPress={() => run('setLogLevel', () => setLogLevel('error'))}
      />

      <Text style={styles.section}>References</Text>
      <AppButton
        title="collection"
        onPress={() => run('collection', () => collection(db, USERS_COLLECTION).path)}
      />
      <AppButton
        title="doc"
        onPress={() => run('doc', () => doc(db, USERS_COLLECTION, docId ?? 'example').path)}
      />
      <AppButton
        title="collectionGroup"
        onPress={() =>
          run('collectionGroup', async () => {
            const snap = await getDocs(query(collectionGroup(db, USERS_COLLECTION), limit(1)));
            return snap.size;
          })
        }
      />
      <AppButton
        title="documentId()"
        onPress={() => run('documentId', () => String(documentId()))}
      />
      <AppButton
        title="refEqual"
        onPress={() =>
          run('refEqual', () => {
            const a = doc(db, USERS_COLLECTION, 'ABC');
            const b = doc(collection(db, USERS_COLLECTION), 'ABC');
            return refEqual(a, b);
          })
        }
      />

      <Text style={styles.section}>Writes</Text>
      <AppButton
        title="addDoc"
        onPress={() =>
          run('addDoc', async () => {
            const ref = await addDoc(usersCol, {
              name: title.trim() || 'Untitled',
              age: 30,
              active: true,
              createdAt: serverTimestamp(),
            });
            setDocId(ref.id);
            return ref.id;
          })
        }
      />
      <AppButton
        title="setDoc"
        onPress={() =>
          run('setDoc', async () => {
            const id = docId ?? doc(usersCol).id;
            await setDoc(doc(usersCol, id), {
              name: title.trim() || 'Untitled',
              age: 30,
              active: true,
            });
            setDocId(id);
            return id;
          })
        }
      />
      <AppButton
        title="setDoc (merge)"
        onPress={() =>
          run('setDoc.merge', () =>
            setDoc(selectedDocRef(), { name: title.trim() || 'Untitled' }, { merge: true }),
          )
        }
      />
      <AppButton
        title="updateDoc"
        onPress={() =>
          run('updateDoc', () =>
            updateDoc(selectedDocRef(), {
              name: title.trim() || 'Untitled',
              updatedAt: serverTimestamp(),
            }),
          )
        }
      />
      <AppButton
        title="deleteDoc"
        onPress={() =>
          run('deleteDoc', async () => {
            await deleteDoc(selectedDocRef());
            setDocId(null);
          })
        }
      />
      <AppButton
        title="serverTimestamp (via updateDoc)"
        onPress={() =>
          run('serverTimestamp', () => updateDoc(selectedDocRef(), { stamped: serverTimestamp() }))
        }
      />
      <AppButton
        title="increment (via updateDoc)"
        onPress={() => run('increment', () => updateDoc(selectedDocRef(), { likes: increment(1) }))}
      />
      <AppButton
        title="arrayUnion / arrayRemove"
        onPress={() =>
          run('arrayUnion', async () => {
            await updateDoc(selectedDocRef(), { tags: arrayUnion('expo') });
            await updateDoc(selectedDocRef(), { tags: arrayRemove('expo') });
            return 'union then remove';
          })
        }
      />
      <AppButton
        title="deleteField"
        onPress={() =>
          run('deleteField', () => updateDoc(selectedDocRef(), { temporary: deleteField() }))
        }
      />
      <AppButton
        title="GeoPoint"
        onPress={() =>
          run('GeoPoint', () =>
            updateDoc(selectedDocRef(), { location: new GeoPoint(53.483959, -2.244644) }),
          )
        }
      />
      <AppButton
        title="Bytes.fromBase64String"
        onPress={() =>
          run('Bytes', () =>
            updateDoc(selectedDocRef(), { avatar: Bytes.fromBase64String('iVBORw0KGgo=') }),
          )
        }
      />
      <AppButton
        title="Timestamp.now()"
        onPress={() =>
          run('Timestamp', () => updateDoc(selectedDocRef(), { lastSeen: Timestamp.now() }))
        }
      />
      <AppButton
        title="vector()"
        onPress={() =>
          run('vector', () => updateDoc(selectedDocRef(), { embedding: vector([0.1, 0.2, 0.3]) }))
        }
      />
      <AppButton
        title="runTransaction"
        onPress={() =>
          run('runTransaction', () =>
            runTransaction(db, async transaction => {
              const snap = await transaction.get(selectedDocRef());
              const data = snap.data() ?? {};
              const likes = typeof data.likes === 'number' ? data.likes : 0;
              transaction.update(selectedDocRef(), { likes: likes + 1 });
              return likes + 1;
            }),
          )
        }
      />
      <AppButton
        title="writeBatch"
        onPress={() =>
          run('writeBatch', async () => {
            const batch = writeBatch(db);
            batch.set(selectedDocRef(), { batched: true }, { merge: true });
            await batch.commit();
            return 'committed';
          })
        }
      />

      <Text style={styles.section}>Reads / listeners</Text>
      <AppButton
        title="getDoc"
        onPress={() =>
          run('getDoc', async () => {
            const snap = await getDoc(selectedDocRef());
            return { exists: snap.exists(), data: snap.data() ?? null };
          })
        }
      />
      <AppButton
        title="getDocs"
        onPress={() =>
          run('getDocs', async () => {
            const snap = await getDocs(usersCol);
            return snap.size;
          })
        }
      />
      <AppButton
        title="getDocFromServer"
        onPress={() =>
          run('getDocFromServer', async () => {
            const snap = await getDocFromServer(selectedDocRef());
            return snap.exists();
          })
        }
      />
      <AppButton
        title="getDocFromCache"
        onPress={() =>
          run('getDocFromCache', async () => {
            const snap = await getDocFromCache(selectedDocRef());
            return snap.exists();
          })
        }
      />
      <AppButton
        title="getDocsFromServer"
        onPress={() =>
          run('getDocsFromServer', async () => {
            const snap = await getDocsFromServer(usersCol);
            return snap.size;
          })
        }
      />
      <AppButton
        title="getDocsFromCache"
        onPress={() =>
          run('getDocsFromCache', async () => {
            const snap = await getDocsFromCache(usersCol);
            return snap.size;
          })
        }
      />
      <AppButton
        title="onSnapshot (extra subscribe)"
        onPress={() =>
          run('onSnapshot', () => {
            const stop = onSnapshot(selectedDocRef(), (snap: DocumentSnapshot<DocumentData>) => {
              showResult(`onSnapshot: ${JSON.stringify(snap.data() ?? null)}`);
            });
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="onSnapshotsInSync"
        onPress={() =>
          run('onSnapshotsInSync', () => {
            const stop = onSnapshotsInSync(db, () => {
              showResult('onSnapshotsInSync: fired');
            });
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="snapshotEqual"
        onPress={() =>
          run('snapshotEqual', async () => {
            const a = await getDoc(selectedDocRef());
            const b = await getDoc(selectedDocRef());
            return snapshotEqual(a, b);
          })
        }
      />

      <Text style={styles.section}>Queries</Text>
      <AppButton
        title="query / where / and / or"
        onPress={() =>
          run('query', async () => {
            const q = query(
              usersCol,
              or(
                and(where('active', '==', true), where('age', '>=', 18)),
                where('name', '==', title.trim() || 'Untitled'),
              ),
            );
            const snap = await getDocs(q);
            return snap.size;
          })
        }
      />
      <AppButton
        title="Filter.and"
        onPress={() =>
          run('Filter', async () => {
            const composite = Filter.and(Filter('active', '==', true), Filter('age', '>=', 18));
            const snap = await getDocs(usersCol.where(composite));
            return { operator: composite.operator, size: snap.size };
          })
        }
      />
      <AppButton
        title="orderBy / limit / limitToLast"
        onPress={() =>
          run('orderBy', async () => {
            const limited = await getDocs(query(usersCol, orderBy('age', 'desc'), limit(5)));
            const last = await getDocs(query(usersCol, orderBy('age', 'asc'), limitToLast(5)));
            return { limit: limited.size, limitToLast: last.size };
          })
        }
      />
      <AppButton
        title="startAt / endAt"
        onPress={() =>
          run('startAt/endAt', async () => {
            const snap = await getDocs(
              query(usersCol, orderBy('age', 'asc'), startAt(0), endAt(120)),
            );
            return snap.size;
          })
        }
      />
      <AppButton
        title="startAfter / endBefore"
        onPress={() =>
          run('startAfter/endBefore', async () => {
            const snap = await getDocs(
              query(usersCol, orderBy('age', 'asc'), startAfter(-1), endBefore(121)),
            );
            return snap.size;
          })
        }
      />
      <AppButton
        title="queryEqual"
        onPress={() =>
          run('queryEqual', () => {
            const q1 = query(usersCol, where('active', '==', true));
            const q2 = query(usersCol, where('active', '==', true));
            return queryEqual(q1, q2);
          })
        }
      />
      <AppButton
        title="getCountFromServer"
        onPress={() =>
          run('getCountFromServer', async () => {
            const snap = await getCountFromServer(usersCol);
            return snap.data().count;
          })
        }
      />
      <AppButton
        title="getAggregateFromServer / sum / average"
        onPress={() =>
          run('getAggregateFromServer', async () => {
            const snap = await getAggregateFromServer(usersCol, {
              users: count(),
              totalAge: sum('age'),
              avgAge: average('age'),
            });
            return snap.data();
          })
        }
      />

      <Text style={styles.section}>Offline / network</Text>
      <AppButton
        title="disableNetwork"
        onPress={() => run('disableNetwork', () => disableNetwork(db))}
      />
      <AppButton
        title="enableNetwork"
        onPress={() => run('enableNetwork', () => enableNetwork(db))}
      />
      <AppButton
        title="waitForPendingWrites"
        onPress={() => run('waitForPendingWrites', () => waitForPendingWrites(db))}
      />
      <AppButton
        title="getPersistentCacheIndexManager + indexes"
        onPress={() =>
          run('persistentCacheIndexes', async () => {
            const manager = getPersistentCacheIndexManager(db);
            if (!manager) {
              return 'no index manager';
            }
            await enablePersistentCacheIndexAutoCreation(manager);
            await disablePersistentCacheIndexAutoCreation(manager);
            await deleteAllPersistentCacheIndexes(manager);
            return 'index manager exercised';
          })
        }
      />

      <Text style={styles.section}>Bundles</Text>
      <AppButton
        title="loadBundle / namedQuery"
        onPress={() =>
          run('loadBundle', async () => {
            // Empty/invalid bundle fails; exercise the call path against the emulator.
            try {
              await loadBundle(
                db,
                '{"metadata":{"id":"expo-empty","createTime":{"seconds":0,"nanos":0},"version":1,"totalDocuments":0,"totalBytes":0}}',
              );
            } catch (e) {
              return `loadBundle error (expected without a real bundle): ${errorMessage(e)}`;
            }
            const named = await namedQuery(db, 'missing-query');
            return named ? 'named query resolved' : 'named query null';
          })
        }
      />

      <Text style={styles.section}>Destructive (can throw / break instance)</Text>
      <Text style={styles.warning}>
        Warning: `terminate`, `clearPersistence`, and `clearIndexedDbPersistence` can throw if
        listeners are still active, and terminate makes this Firestore instance unusable until the
        app reloads.
      </Text>
      <AppButton
        title="terminate() — can throw / break instance"
        variant="secondary"
        onPress={() => run('terminate', () => terminate(db))}
      />
      <AppButton
        title="clearPersistence() — can throw"
        variant="secondary"
        onPress={() => run('clearPersistence', () => clearPersistence(db))}
      />
      <AppButton
        title="clearIndexedDbPersistence() — can throw"
        variant="secondary"
        onPress={() => run('clearIndexedDbPersistence', () => clearIndexedDbPersistence(db))}
      />
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.subtleText, fontSize: 13, lineHeight: 18 },
  section: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  subtle: { color: theme.subtleText },
  warning: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
