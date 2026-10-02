import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  Bytes,
  CACHE_SIZE_UNLIMITED,
  FieldPath,
  Filter,
  GeoPoint,
  SDK_VERSION,
  Timestamp,
  addDoc,
  aggregateFieldEqual,
  aggregateQuerySnapshotEqual,
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
  type FirestoreDataConverter,
  type Unsubscribe,
} from '@react-native-firebase/firestore';
import {
  average as pipelineAverage,
  constant,
  countAll,
  execute,
  field,
  ifAbsent,
  ifNull,
  mapGet,
  pipelineResultEqual,
  subcollection,
  switchOn,
  timestampDiff,
  timestampExtract,
  toUpper,
  currentDocument,
  equal,
  variable,
} from '@react-native-firebase/firestore/pipelines';

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

function errorCode(e: unknown): string | undefined {
  return typeof e === 'object' && e !== null && 'code' in e
    ? String((e as { code: unknown }).code)
    : undefined;
}

type City = { name: string; population: number };

/** Converter used by the `withConverter` control (same shape as the docs sample). */
const cityConverter: FirestoreDataConverter<City> = {
  toFirestore: city => ({ name: city.name, population: city.population }),
  fromFirestore: snapshot => {
    const data = snapshot.data();
    return { name: String(data.name), population: Number(data.population) };
  },
};

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
    const unsubscribe = onSnapshot(
      usersCol,
      snapshot => {
        setDocId(current => current ?? snapshot.docs[0]?.id ?? null);
      },
      listenerError => {
        setResult(null);
        setError(`Users listener failed: ${errorMessage(listenerError)}`);
      },
    );
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
        title="initializeFirestore (settings)"
        variant="secondary"
        onPress={() =>
          run('initializeFirestore', () => {
            const instance = initializeFirestore(getApp(), {
              persistence: true,
              cacheSizeBytes: CACHE_SIZE_UNLIMITED,
              ignoreUndefinedProperties: true,
              serverTimestampBehavior: 'estimate',
            });
            return Boolean(instance);
          })
        }
      />
      <Text style={styles.warning}>
        Warning: settings are stored natively and read when the native Firestore instance is
        created. Calling `initializeFirestore` after Firestore has started does not throw, but the
        new settings do not apply to the running instance (they apply again after `terminate`).
      </Text>
      <AppButton
        title="initializeFirestore (invalid ssl, throws)"
        variant="secondary"
        onPress={() =>
          run('initializeFirestore.invalid', () =>
            // WARNING: throws synchronously, `ssl` must be a boolean. Other invalid values
            // reject a promise that initializeFirestore does not return.
            Boolean(initializeFirestore(getApp(), { ssl: 'yes' as unknown as boolean })),
          )
        }
      />
      <Text style={styles.warning}>
        Warning: this control is expected to throw. Other invalid settings (for example a small
        `cacheSizeBytes`) become unhandled promise rejections instead of exceptions.
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
      <AppButton
        title="subcollection ref + auto-id doc()"
        onPress={() =>
          run('subcollection', () => {
            const messages = collection(selectedDocRef(), 'messages');
            return { path: messages.path, autoId: doc(messages).id.length };
          })
        }
      />
      <AppButton
        title="FieldPath (build + isEqual)"
        onPress={() =>
          run('FieldPath', () => {
            const zip = new FieldPath('info', 'address', 'zipcode');
            const dotted = new FieldPath('settings', 'theme.color');
            return {
              zip: zip.toString(),
              dotted: dotted.toString(),
              equal: zip.isEqual(new FieldPath('info', 'address', 'zipcode')),
            };
          })
        }
      />
      <AppButton
        title="FieldPath in where / orderBy / get"
        onPress={() =>
          run('FieldPath.query', async () => {
            const ageField = new FieldPath('age');
            const snap = await getDocs(
              query(usersCol, where(ageField, '>=', 0), orderBy(ageField, 'asc'), limit(3)),
            );
            return { size: snap.size, firstAge: snap.docs[0]?.get(ageField) ?? null };
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
        title="setDoc (mergeFields)"
        onPress={() =>
          run('setDoc.mergeFields', () =>
            setDoc(
              selectedDocRef(),
              { name: title.trim() || 'Untitled', ignored: 'not written' },
              { mergeFields: ['name'] },
            ),
          )
        }
      />
      <AppButton
        title="setDoc (undefined value, can fail)"
        variant="secondary"
        onPress={() =>
          // WARNING: fails with an error unless ignoreUndefinedProperties is applied.
          run('setDoc.undefined', () => setDoc(selectedDocRef(), { missing: undefined }))
        }
      />
      <Text style={styles.warning}>
        Warning: writing an `undefined` field value fails unless `ignoreUndefinedProperties` is set
        before Firestore starts.
      </Text>
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
        title="Bytes.fromUint8Array"
        onPress={() =>
          run('Bytes.fromUint8Array', async () => {
            const bytes = Bytes.fromUint8Array(new Uint8Array([1, 2, 3]));
            await updateDoc(selectedDocRef(), { 'info.thumbnail': bytes });
            return bytes.toBase64();
          })
        }
      />
      <AppButton
        title="Timestamp.now()"
        onPress={() =>
          run('Timestamp', () => updateDoc(selectedDocRef(), { lastSeen: Timestamp.now() }))
        }
      />
      <AppButton
        title="Timestamp.fromDate / fromMillis"
        onPress={() =>
          run('Timestamp.from', async () => {
            await updateDoc(selectedDocRef(), {
              born: Timestamp.fromDate(new Date('1815-12-10')),
              checkedAt: Timestamp.fromMillis(Date.now()),
            });
            return new Timestamp(0, 0).toDate().toISOString();
          })
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
        title="runTransaction (set / delete, maxAttempts)"
        onPress={() =>
          run('runTransaction.setDelete', () =>
            runTransaction(
              db,
              async transaction => {
                const scratch = doc(usersCol);
                transaction.set(scratch, { scratch: true }).delete(scratch);
                return 'set then delete in one transaction';
              },
              { maxAttempts: 3 },
            ),
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
      <AppButton
        title="writeBatch (set / update / delete chain)"
        onPress={() =>
          run('writeBatch.chain', async () => {
            const scratch = doc(usersCol);
            const batch = writeBatch(db)
              .set(scratch, { scratch: true })
              .update(scratch, { scratch: false })
              .delete(scratch);
            await batch.commit();
            return 'committed';
          })
        }
      />
      <AppButton
        title="withConverter (setDoc + getDoc)"
        onPress={() =>
          run('withConverter', async () => {
            const cities = collection(db, 'expo-cities').withConverter(cityConverter);
            const ref = doc(cities, 'london');
            await setDoc(ref, { name: 'London', population: 9_000_000 });
            const snap = await getDoc(ref);
            const city = snap.data();
            const untyped = collection(db, 'expo-cities').withConverter(null);
            return { city: city ?? null, untypedPath: untyped.path };
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
            const stop = onSnapshot(
              selectedDocRef(),
              (snap: DocumentSnapshot<DocumentData>) => {
                showResult(`onSnapshot: ${JSON.stringify(snap.data() ?? null)}`);
              },
              listenerError => showError(listenerError),
            );
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="onSnapshot (includeMetadataChanges + docChanges)"
        onPress={() =>
          run('onSnapshot.metadata', () => {
            const stop = onSnapshot(
              usersCol,
              { includeMetadataChanges: true },
              snapshot => {
                const changes = snapshot
                  .docChanges({ includeMetadataChanges: true })
                  .map(change => ({
                    type: change.type,
                    oldIndex: change.oldIndex,
                    newIndex: change.newIndex,
                  }));
                showResult(
                  `onSnapshot.metadata: fromCache=${snapshot.metadata.fromCache} pending=${snapshot.metadata.hasPendingWrites} changes=${JSON.stringify(changes)}`,
                );
              },
              listenerError => showError(listenerError),
            );
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="onSnapshot (source: 'cache')"
        onPress={() =>
          run('onSnapshot.cache', () => {
            const stop = onSnapshot(
              usersCol,
              { source: 'cache' },
              snapshot => showResult(`onSnapshot.cache: ${snapshot.size} docs`),
              listenerError => showError(listenerError),
            );
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="onSnapshot (lone callback, no error handler)"
        variant="secondary"
        onPress={() =>
          run('onSnapshot.lone', () => {
            // WARNING: a listener error calls this callback with a null snapshot.
            const stop = onSnapshot(usersCol, snapshot => {
              showResult(`onSnapshot.lone: ${snapshot ? snapshot.size : 'null snapshot'}`);
            });
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <Text style={styles.warning}>
        Warning: without an error callback a failed listener delivers a null snapshot to the next
        callback, so read `snapshot` defensively or always pass an error callback.
      </Text>
      <AppButton
        title="Unsubscribe all extra listeners"
        variant="secondary"
        onPress={() =>
          run('unsubscribeAll', () => {
            const total = unsubscribers.current.length;
            for (const stop of unsubscribers.current) {
              stop();
            }
            unsubscribers.current = [];
            return `unsubscribed ${total}`;
          })
        }
      />
      <AppButton
        title="data({ serverTimestamps }) / get(FieldPath)"
        onPress={() =>
          run('serverTimestamps', async () => {
            const ref = selectedDocRef();
            await updateDoc(ref, { stamped: serverTimestamp() });
            const snap = await getDoc(ref);
            return {
              estimate: String(snap.data({ serverTimestamps: 'estimate' })?.stamped),
              previous: String(snap.data({ serverTimestamps: 'previous' })?.stamped),
              none: String(snap.data({ serverTimestamps: 'none' })?.stamped),
              byFieldPath: String(snap.get(new FieldPath('stamped'))),
            };
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
        title="where: in / not-in / != / array-contains-any"
        onPress={() =>
          run('where.operators', async () => {
            const inSnap = await getDocs(query(usersCol, where('age', 'in', [30, 31, 32])));
            const notInSnap = await getDocs(query(usersCol, where('age', 'not-in', [0, 1])));
            const notEqualSnap = await getDocs(query(usersCol, where('active', '!=', false)));
            const anySnap = await getDocs(
              query(usersCol, where('tags', 'array-contains-any', ['expo', 'rn'])),
            );
            return {
              in: inSnap.size,
              notIn: notInSnap.size,
              notEqual: notEqualSnap.size,
              arrayContainsAny: anySnap.size,
            };
          })
        }
      />
      <AppButton
        title="where(documentId(), 'in', [...])"
        onPress={() =>
          run('where.documentId', async () => {
            const ids = docId ? [docId] : ['missing'];
            const snap = await getDocs(query(usersCol, where(documentId(), 'in', ids)));
            return snap.size;
          })
        }
      />
      <AppButton
        title="Filter.or"
        onPress={() =>
          run('Filter.or', async () => {
            const composite = Filter.or(Filter('age', '<', 18), Filter('age', '>', 65));
            const snap = await getDocs(usersCol.where(composite));
            return { operator: composite.operator, size: snap.size };
          })
        }
      />
      <AppButton
        title="startAfter(snapshot) pagination"
        onPress={() =>
          run('startAfter.snapshot', async () => {
            const first = await getDocs(query(usersCol, orderBy('age'), limit(2)));
            const last = first.docs[first.docs.length - 1];
            if (!last) {
              return 'no documents to page from';
            }
            const next = await getDocs(query(usersCol, orderBy('age'), startAfter(last), limit(2)));
            return { firstPage: first.size, nextPage: next.size };
          })
        }
      />
      <AppButton
        title="where with undefined value (throws)"
        variant="secondary"
        onPress={() =>
          // WARNING: throws, query values cannot be undefined.
          run('where.undefined', () => query(usersCol, where('age', '==', undefined)))
        }
      />
      <Text style={styles.warning}>
        Warning: the control above is expected to throw; `undefined` is not a valid query value (use
        `null` for equality with null).
      </Text>
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
      <AppButton
        title="aggregateFieldEqual / aggregateQuerySnapshotEqual"
        onPress={() =>
          run('aggregateEqual', async () => {
            const spec = { users: count(), totalAge: sum('age') };
            const a = await getAggregateFromServer(usersCol, spec);
            const b = await getAggregateFromServer(usersCol, spec);
            return {
              fieldEqual: aggregateFieldEqual(spec.users, count()),
              snapshotEqual: aggregateQuerySnapshotEqual(a, b),
            };
          })
        }
      />
      <AppButton
        title="Error code (updateDoc on missing doc)"
        variant="secondary"
        onPress={() =>
          run('errorCode', async () => {
            try {
              // WARNING: rejects, updateDoc fails when the document does not exist.
              await updateDoc(doc(usersCol, `missing-${Date.now()}`), { name: 'nobody' });
              return 'unexpectedly succeeded';
            } catch (e) {
              return `caught code=${errorCode(e)} message=${errorMessage(e)}`;
            }
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
      <AppButton
        title="loadBundle onProgress (LoadBundleTask)"
        variant="secondary"
        onPress={() =>
          run('loadBundle.onProgress', async () => {
            // WARNING: the bundle below is not a real bundle, so the task reports an error.
            const task = loadBundle(db, '{"metadata":{"id":"expo-progress"}}');
            const states: string[] = [];
            task.onProgress(
              progress => {
                states.push(progress.taskState);
              },
              progressError => {
                states.push(`error: ${errorMessage(progressError)}`);
              },
            );
            try {
              await task;
            } catch (e) {
              states.push(`rejected: ${errorMessage(e)}`);
            }
            return states;
          })
        }
      />
      <Text style={styles.warning}>
        Warning: both bundle controls feed placeholder bundles, so they are expected to report an
        error. `namedQuery` resolves with a Query; running that query rejects when the name was
        never loaded in a bundle.
      </Text>

      <Text style={styles.section}>Pipelines (Enterprise database only)</Text>
      <Text style={styles.warning}>
        Warning: pipelines run in the cloud against a Firestore Enterprise database. The local
        emulator does not support them, so the execute control is expected to fail here. The build
        control only constructs expressions and does not touch the network.
      </Text>
      <AppButton
        title="pipelines: build expressions"
        onPress={() =>
          run('pipelines.build', () => {
            const expressions = [
              ifNull(field('nickname'), constant('none')),
              toUpper(ifAbsent(field('name'), constant('anonymous'))),
              switchOn(equal(field('active'), constant(true)), constant('on'), constant('off')),
              timestampDiff(field('endTime'), field('startTime'), 'day'),
              timestampExtract(field('createdAt'), 'hour', 'America/Los_Angeles'),
              mapGet(currentDocument(), 'name'),
              mapGet(variable('doc'), 'title'),
              // Detached pipeline: embedded as a scalar expression, never executed on its own.
              subcollection('reviews')
                .aggregate(countAll().as('reviewCount'), pipelineAverage('rating').as('avgRating'))
                .toScalarExpression()
                .as('reviewSummary'),
            ];
            return `built ${expressions.length} expressions`;
          })
        }
      />
      <AppButton
        title="pipelines: execute (fails on the emulator)"
        variant="secondary"
        onPress={() =>
          run('pipelines.execute', async () => {
            // WARNING: needs an Enterprise database, expected to fail against the emulator.
            const build = () =>
              db
                .pipeline()
                .collection(USERS_COLLECTION)
                .select(
                  toUpper(ifAbsent(field('name'), constant('anonymous'))).as('name'),
                  ifNull(field('nickname'), constant('none')).as('nickname'),
                )
                .limit(3);
            const first = await execute(build());
            const second = await execute(build());
            const a = first.results[0];
            const b = second.results[0];
            return {
              rows: first.results.length,
              executionTime: first.executionTime?.toDate().toISOString() ?? null,
              resultEqual: a && b ? pipelineResultEqual(a, b) : null,
            };
          })
        }
      />

      <Text style={styles.section}>Destructive (can throw / break instance)</Text>
      <Text style={styles.warning}>
        Warning: `terminate` shuts down the native instance and clears its emulator registration, so
        the next Firestore call recreates the instance and this screen reconnects to the emulator.
        `clearPersistence` and `clearIndexedDbPersistence` (an alias for the same call) can throw
        while the instance is running, so the clear controls below call `terminate` first.
      </Text>
      <AppButton
        title="terminate() (next call recreates the instance)"
        variant="secondary"
        onPress={() =>
          run('terminate', async () => {
            await terminate(db);
            // The native instance (and its emulator registration) is gone; reconnect on next use.
            emulatorConnected = false;
          })
        }
      />
      <AppButton
        title="terminate() then clearPersistence()"
        variant="secondary"
        onPress={() =>
          run('clearPersistence', async () => {
            await terminate(db);
            emulatorConnected = false;
            await clearPersistence(db);
          })
        }
      />
      <AppButton
        title="terminate() then clearIndexedDbPersistence()"
        variant="secondary"
        onPress={() =>
          run('clearIndexedDbPersistence', async () => {
            await terminate(db);
            emulatorConnected = false;
            await clearIndexedDbPersistence(db);
          })
        }
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
