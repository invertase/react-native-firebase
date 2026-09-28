import { useState } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getToken, initializeAppCheck, type AppCheck } from '@react-native-firebase/app-check';

import { ScreenChrome } from '../src/ScreenChrome';

// initializeAppCheck must only be called once per app; module-level memoization
// so re-running this screen after the first press reuses the same instance
// instead of re-initializing (and erroring) on every press.
let appCheckInstance: AppCheck | undefined;

function getOrInitializeAppCheck(): AppCheck {
  if (!appCheckInstance) {
    appCheckInstance = initializeAppCheck(getApp(), {
      provider: {
        providerOptions: {
          android: { provider: 'debug' },
          apple: { provider: 'debug' },
        },
      },
    });
  }
  return appCheckInstance;
}

export default function AppCheckScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const appCheck = getOrInitializeAppCheck();
      const tokenResult = await getToken(appCheck);
      setResult(JSON.stringify({ token: tokenResult.token }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return <ScreenChrome title="app-check" onRun={handleRun} result={result} error={error} />;
}
