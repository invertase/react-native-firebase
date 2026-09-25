import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  SDK_VERSION,
  child,
  connectDatabaseEmulator,
  enableLogging,
  endAt,
  endBefore,
  equalTo,
  forceLongPolling,
  forceWebSockets,
  get,
  getDatabase,
  getServerTime,
  goOffline,
  goOnline,
  increment,
  keepSynced,
  limitToFirst,
  limitToLast,
  off,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
  onDisconnect,
  onValue,
  orderByChild,
  orderByKey,
  orderByPriority,
  orderByValue,
  push,
  query,
  ref,
  refFromURL,
  remove,
  runTransaction,
  serverTimestamp,
  set,
  setLoggingEnabled,
  setPersistenceCacheSizeBytes,
  setPersistenceEnabled,
  setPriority,
  setWithPriority,
  startAfter,
  startAt,
  update,
  type DataSnapshot,
  type Unsubscribe,
} from '@react-native-firebase/database';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { TextField } from '../src/TextField';
import { theme } from '../src/theme';

/** Same host mapping as `packages/app/e2e/helpers.js` `getE2eEmulatorHost`. */
function getDatabaseEmulatorHost(): string {
  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
}

/** Default database port from `.github/workflows/scripts/firebase.emulator.template.json`. */
const DATABASE_EMULATOR_PORT = 9000;

const TODOS_PATH = '/expo-todos';

type TodoItem = {
  key: string;
  title: string;
  done: boolean;
  priority?: string | number | null;
  updatedAt?: unknown;
};

let emulatorConnected = false;

function ensureDatabaseEmulator(): void {
  if (emulatorConnected) {
    return;
  }
  connectDatabaseEmulator(getDatabase(), getDatabaseEmulatorHost(), DATABASE_EMULATOR_PORT);
  emulatorConnected = true;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function DatabaseScreen() {
  const [title, setTitle] = useState('Buy milk');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keepSyncedOn, setKeepSyncedOn] = useState(false);
  const [loggingOn, setLoggingOn] = useState(false);
  const [persistenceOn, setPersistenceOn] = useState(false);
  const unsubscribers = useRef<Unsubscribe[]>([]);

  const db = useMemo(() => getDatabase(), []);
  const todosRef = useMemo(() => ref(db, TODOS_PATH), [db]);

  useEffect(() => {
    ensureDatabaseEmulator();
    const unsubscribe = onValue(todosRef, (snapshot: DataSnapshot) => {
      const next: TodoItem[] = [];
      snapshot.forEach((childSnap: DataSnapshot) => {
        const value = childSnap.val() as { title?: string; done?: boolean; priority?: unknown } | null;
        next.push({
          key: childSnap.key ?? '',
          title: value?.title ?? '(untitled)',
          done: Boolean(value?.done),
          priority: (value?.priority as string | number | null | undefined) ?? null,
          updatedAt: value && 'updatedAt' in value ? (value as { updatedAt?: unknown }).updatedAt : undefined,
        });
        return undefined;
      });
      setTodos(next);
      setSelectedKey(current => current ?? next[0]?.key ?? null);
    });
    return () => {
      unsubscribe();
      for (const stop of unsubscribers.current) {
        stop();
      }
      unsubscribers.current = [];
    };
  }, [todosRef]);

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
      ensureDatabaseEmulator();
      const value = await action();
      showResult(typeof value === 'string' ? value : `${label}: ok${value === undefined ? '' : ` → ${JSON.stringify(value)}`}`);
    } catch (e) {
      showError(e);
    }
  }

  function selectedTodoRef() {
    if (!selectedKey) {
      throw new Error('Select a todo first (tap one in the list).');
    }
    return child(todosRef, selectedKey);
  }

  function trackUnsubscribe(stop: Unsubscribe) {
    unsubscribers.current.push(stop);
  }

  return (
    <ScreenChrome title="database" result={result} error={error}>
      <Text style={styles.hint}>
        Connects to the Realtime Database emulator at {getDatabaseEmulatorHost()}:{DATABASE_EMULATOR_PORT}{' '}
        (same host mapping as the e2e helpers; CI default port 9000).
      </Text>

      <TextField
        placeholder="Todo title"
        value={title}
        onChangeText={setTitle}
        autoCapitalize="sentences"
      />

      <View style={styles.list}>
        <Text style={styles.section}>Todos</Text>
        {todos.length === 0 ? <Text style={styles.subtle}>No todos yet.</Text> : null}
        {todos.map(item => (
          <AppButton
            key={item.key}
            variant={item.key === selectedKey ? 'primary' : 'secondary'}
            title={`${item.done ? '✓ ' : ''}${item.title} (${item.key.slice(-6)})`}
            onPress={() => setSelectedKey(item.key)}
          />
        ))}
      </View>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getDatabase"
        onPress={() => run('getDatabase', () => Boolean(getDatabase()))}
      />
      <AppButton
        title="connectDatabaseEmulator"
        onPress={() =>
          run('connectDatabaseEmulator', () => {
            ensureDatabaseEmulator();
            return `${getDatabaseEmulatorHost()}:${DATABASE_EMULATOR_PORT}`;
          })
        }
      />
      <AppButton title="goOffline" onPress={() => run('goOffline', () => goOffline(db))} />
      <AppButton title="goOnline" onPress={() => run('goOnline', () => goOnline(db))} />
      <AppButton
        title="ref"
        onPress={() => run('ref', () => ref(db, TODOS_PATH).toString())}
      />
      <AppButton
        title="refFromURL"
        onPress={() =>
          run('refFromURL', () => {
            const databaseURL = getApp().options.databaseURL;
            if (!databaseURL) {
              throw new Error('getApp().options.databaseURL is missing');
            }
            return refFromURL(db, `${databaseURL}${TODOS_PATH}`).toString();
          })
        }
      />
      <AppButton
        title="getServerTime"
        onPress={() => run('getServerTime', () => getServerTime(db).toISOString())}
      />

      <Text style={styles.section}>RN persistence / logging</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>setPersistenceEnabled</Text>
        <Switch
          value={persistenceOn}
          onValueChange={value => {
            setPersistenceOn(value);
            void run('setPersistenceEnabled', () => setPersistenceEnabled(db, value));
          }}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>setLoggingEnabled</Text>
        <Switch
          value={loggingOn}
          onValueChange={value => {
            setLoggingOn(value);
            void run('setLoggingEnabled', () => setLoggingEnabled(db, value));
          }}
        />
      </View>
      <AppButton
        title="setPersistenceCacheSizeBytes (2MB)"
        onPress={() => run('setPersistenceCacheSizeBytes', () => setPersistenceCacheSizeBytes(db, 2_000_000))}
      />
      <View style={styles.row}>
        <Text style={styles.rowLabel}>keepSynced</Text>
        <Switch
          value={keepSyncedOn}
          onValueChange={value => {
            setKeepSyncedOn(value);
            void run('keepSynced', () => keepSynced(todosRef, value));
          }}
        />
      </View>

      <Text style={styles.section}>Writes</Text>
      <AppButton
        title="push"
        onPress={() =>
          run('push', async () => {
            const newRef = push(todosRef);
            await set(newRef, {
              title: title.trim() || 'Untitled',
              done: false,
              createdAt: serverTimestamp(),
            });
            if (newRef.key) {
              setSelectedKey(newRef.key);
            }
            return newRef.key;
          })
        }
      />
      <AppButton
        title="set"
        onPress={() =>
          run('set', () =>
            set(selectedTodoRef(), {
              title: title.trim() || 'Untitled',
              done: false,
              updatedAt: serverTimestamp(),
            }),
          )
        }
      />
      <AppButton
        title="update"
        onPress={() =>
          run('update', () =>
            update(selectedTodoRef(), {
              title: title.trim() || 'Untitled',
              updatedAt: serverTimestamp(),
            }),
          )
        }
      />
      <AppButton
        title="remove"
        onPress={() =>
          run('remove', async () => {
            await remove(selectedTodoRef());
            setSelectedKey(null);
          })
        }
      />
      <AppButton
        title="setPriority"
        onPress={() => run('setPriority', () => setPriority(selectedTodoRef(), 1))}
      />
      <AppButton
        title="setWithPriority"
        onPress={() =>
          run('setWithPriority', () =>
            setWithPriority(
              selectedTodoRef(),
              { title: title.trim() || 'Untitled', done: false },
              2,
            ),
          )
        }
      />
      <AppButton
        title="serverTimestamp (via update)"
        onPress={() => run('serverTimestamp', () => update(selectedTodoRef(), { stamped: serverTimestamp() }))}
      />
      <AppButton
        title="increment (via update)"
        onPress={() => run('increment', () => update(selectedTodoRef(), { likes: increment(1) }))}
      />
      <AppButton
        title="runTransaction (toggle done)"
        onPress={() =>
          run('runTransaction', async () => {
            const resultTx = await runTransaction(selectedTodoRef(), (current: Record<string, unknown> | null) => {
              if (!current || typeof current !== 'object') {
                return { title: title.trim() || 'Untitled', done: true };
              }
              return { ...current, done: !current.done };
            });
            return resultTx.snapshot.val();
          })
        }
      />
      <AppButton
        title="onDisconnect().remove()"
        onPress={() => run('onDisconnect', () => onDisconnect(selectedTodoRef()).remove())}
      />
      <AppButton
        title="onDisconnect().cancel()"
        onPress={() =>
          run('onDisconnect.cancel', async () => {
            const disconnect = onDisconnect(selectedTodoRef());
            await disconnect.set({ done: true });
            await disconnect.cancel();
            return 'cancelled';
          })
        }
      />

      <Text style={styles.section}>Reads / listeners</Text>
      <AppButton
        title="child"
        onPress={() => run('child', () => child(todosRef, selectedKey ?? 'missing').toString())}
      />
      <AppButton
        title="get"
        onPress={() =>
          run('get', async () => {
            const snapshot = await get(todosRef);
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="onValue (subscribe once more)"
        onPress={() =>
          run('onValue', () => {
            const stop = onValue(todosRef, (snap: DataSnapshot) => {
              showResult(`onValue: ${JSON.stringify(snap.val())}`);
            });
            trackUnsubscribe(stop);
            return 'subscribed (call returned unsubscribe)';
          })
        }
      />
      <AppButton
        title="onValue(.info/serverTimeOffset)"
        onPress={() =>
          run('serverTimeOffset', () => {
            const offsetRef = ref(db, '.info/serverTimeOffset');
            const stop = onValue(offsetRef, (snap: DataSnapshot) => {
              const offset = snap.val() as number;
              showResult(
                `serverTimeOffset: ${offset}; estimated=${new Date(Date.now() + offset).toISOString()}`,
              );
            });
            trackUnsubscribe(stop);
            return 'subscribed to .info/serverTimeOffset';
          })
        }
      />
      <AppButton
        title="onChildAdded"
        onPress={() =>
          run('onChildAdded', () => {
            const stop = onChildAdded(todosRef, (snap: DataSnapshot) => {
              showResult(`onChildAdded: ${snap.key}`);
            });
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="onChildChanged"
        onPress={() =>
          run('onChildChanged', () => {
            const stop = onChildChanged(todosRef, (snap: DataSnapshot) => {
              showResult(`onChildChanged: ${snap.key}`);
            });
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="onChildMoved"
        onPress={() =>
          run('onChildMoved', () => {
            const stop = onChildMoved(todosRef, (snap: DataSnapshot) => {
              showResult(`onChildMoved: ${snap.key}`);
            });
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="onChildRemoved"
        onPress={() =>
          run('onChildRemoved', () => {
            const stop = onChildRemoved(todosRef, (snap: DataSnapshot) => {
              showResult(`onChildRemoved: ${snap.key}`);
            });
            trackUnsubscribe(stop);
            return 'subscribed';
          })
        }
      />
      <AppButton
        title="off() — throws"
        variant="secondary"
        onPress={() =>
          run('off', () => {
            // WARNING: off() is not implemented - use unsubscriber callback returned when subscribing
            off(todosRef);
          })
        }
      />
      <Text style={styles.warning}>
        Warning: `off() is not implemented - use unsubscriber callback returned when subscribing`. Pressing
        the button calls `off()` so you can see the thrown error.
      </Text>

      <Text style={styles.section}>Queries</Text>
      <AppButton
        title="query"
        onPress={() =>
          run('query', async () => {
            const snapshot = await get(query(todosRef, orderByKey(), limitToFirst(5)));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="orderByChild('title')"
        onPress={() =>
          run('orderByChild', async () => {
            const snapshot = await get(query(todosRef, orderByChild('title')));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="orderByKey"
        onPress={() =>
          run('orderByKey', async () => {
            const snapshot = await get(query(todosRef, orderByKey()));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="orderByPriority"
        onPress={() =>
          run('orderByPriority', async () => {
            const snapshot = await get(query(todosRef, orderByPriority()));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="orderByValue"
        onPress={() =>
          run('orderByValue', async () => {
            const scoresRef = ref(db, '/expo-scores');
            await set(scoresRef, { a: 1, b: 3, c: 2 });
            const snapshot = await get(query(scoresRef, orderByValue()));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="limitToFirst(2)"
        onPress={() =>
          run('limitToFirst', async () => {
            const snapshot = await get(query(todosRef, orderByKey(), limitToFirst(2)));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="limitToLast(2)"
        onPress={() =>
          run('limitToLast', async () => {
            const snapshot = await get(query(todosRef, orderByKey(), limitToLast(2)));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="startAt"
        onPress={() =>
          run('startAt', async () => {
            const snapshot = await get(query(todosRef, orderByKey(), startAt(selectedKey ?? '')));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="startAfter"
        onPress={() =>
          run('startAfter', async () => {
            const snapshot = await get(query(todosRef, orderByKey(), startAfter(selectedKey ?? '')));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="endAt"
        onPress={() =>
          run('endAt', async () => {
            const snapshot = await get(query(todosRef, orderByKey(), endAt(selectedKey ?? '\uffff')));
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="endBefore"
        onPress={() =>
          run('endBefore', async () => {
            const snapshot = await get(
              query(todosRef, orderByKey(), endBefore(selectedKey ?? '\uffff')),
            );
            return snapshot.val();
          })
        }
      />
      <AppButton
        title="equalTo"
        onPress={() =>
          run('equalTo', async () => {
            const snapshot = await get(query(todosRef, orderByChild('done'), equalTo(false)));
            return snapshot.val();
          })
        }
      />

      <Text style={styles.section}>Not implemented (throw)</Text>
      <AppButton
        title="forceLongPolling() — throws"
        variant="secondary"
        onPress={() => run('forceLongPolling', () => forceLongPolling())}
      />
      <AppButton
        title="forceWebSockets() — throws"
        variant="secondary"
        onPress={() => run('forceWebSockets', () => forceWebSockets())}
      />
      <AppButton
        title="enableLogging() — throws"
        variant="secondary"
        onPress={() => run('enableLogging', () => enableLogging(true))}
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
  list: { gap: 8 },
  subtle: { color: theme.subtleText },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowLabel: { color: theme.text, fontSize: 16, fontWeight: '600', flex: 1, paddingRight: 12 },
  warning: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
