import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from '@react-native-firebase/auth';

/**
 * Live current-user state, driven by `onAuthStateChanged` rather than a
 * one-shot `getAuth().currentUser` read that would go stale after sign-in/out.
 */
export function useAuthUser(): { user: User | null; initializing: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  return { user, initializing };
}
