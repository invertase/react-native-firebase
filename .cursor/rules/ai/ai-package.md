# React Native Firebase AI Package - Porting Rules from Firebase JS SDK

This document describes the **intentional differences** between the React Native Firebase AI package and the Firebase JS SDK AI package. Use this to distinguish between known architectural differences and actual missing features that need to be ported.

---

## 🎯 Purpose

When comparing this React Native Firebase AI package with the Firebase JS SDK AI package (from `firebase/firebase-js-sdk`), this file documents all **expected and correct** differences. Any difference NOT listed here is potentially a missing feature that should be evaluated for porting.

This cursor rules file lives in `.cursor/rules/` and helps AI assistants understand the intentional architectural differences between the web and mobile implementations.

### 📦 Setup for Comparison
To effectively use this file for feature parity checks:
1. Clone both repositories locally:
   - `git clone https://github.com/invertase/react-native-firebase.git`
   - `git clone https://github.com/firebase/firebase-js-sdk.git`
2. When asking AI to compare, reference both package directories
3. Use these cursor rules to filter out known differences

---

## 📁 Structural Differences (INTENTIONAL - Do Not Port)

### 1. Source Code Location
- **Firebase JS SDK**: Uses `src/` folder
- **React Native Firebase**: Uses `lib/` folder
- **Reason**: React Native Firebase convention

### 2. Entry Point Architecture
- **Firebase JS SDK**:
  - `src/index.ts` - Component registration and exports
  - `src/api.ts` - Public API exports (getAI, getGenerativeModel, etc.)
- **React Native Firebase**:
  - `lib/index.ts` - Combined entry point with all exports
- **Reason**: RN doesn't use Firebase's component registration system

### 3. Test File Organization
- **Firebase JS SDK**: Tests live alongside source in `src/` (e.g., `src/api.test.ts`, `src/models/ai-model.test.ts`)
- **React Native Firebase**: Tests in `__tests__/` at package root
- **Reason**: React Native Firebase testing convention

**IMPORTANT**: Tests MUST be ported and kept in sync!
- File names match between packages (e.g., `src/api.test.ts` → `__tests__/api.test.ts`)
- RN uses different testing tools (Jest with React Native setup vs Karma/Mocha)
- Test logic and coverage should match, even if test utilities differ
- When porting features, ALWAYS port the corresponding tests

### Testing Tools Differences

**Firebase JS SDK uses:**
- Karma test runner
- Mocha/Chai for assertions
- Browser-based test environment
- Tests run alongside source code

**React Native Firebase uses:**
- Jest test framework
- Jest assertions and matchers
- React Native test environment
- Tests in dedicated `__tests__/` directory

**When porting tests:**
- Convert Mocha `describe/it` to Jest (mostly compatible)
- Replace Chai assertions with Jest matchers
- Remove browser-specific test setup
- Keep test file names identical for traceability
- Maintain same test coverage and logic
- **IMPORTANT**: Follow ESLint requirements to ensure tests pass linting (see below)

### 4. ESLint Requirements for Tests

**CRITICAL**: All test files MUST pass ESLint. The project uses Mocha ESLint plugin even though tests use Jest.

**Required imports:**
```typescript
import { describe, expect, it, jest } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
```

**Key rules to follow:**

1. **Import Jest globals explicitly** - Do NOT rely on global types:
   ```typescript
   // ✅ CORRECT
   import { describe, expect, it, jest } from '@jest/globals';

   // ❌ WRONG - Will cause "Cannot find name 'describe'" errors
   // (no import)
   ```

2. **Use regular functions, NOT arrow functions** (mocha/no-mocha-arrows):
   ```typescript
   // ✅ CORRECT
   describe('MyTest', function () {
     it('does something', function () {
       // test code
     });
   });

   // ❌ WRONG - Violates mocha/no-mocha-arrows
   describe('MyTest', () => {
     it('does something', () => {
       // test code
     });
   });
   ```

3. **Type assertions for test objects**:
   ```typescript
   // ✅ CORRECT - Cast to proper RN types
   const fakeAI: AI = {
     app: {
       name: 'DEFAULT',
       options: { apiKey: 'key' }
     } as ReactNativeFirebase.FirebaseApp,
     backend: new VertexAIBackend('us-central1'),
     location: 'us-central1',
   };

   // For complex mocks needing double casting:
   const mockService = {
     ...fakeAI,
     appCheck: { getToken: mockFn }
   } as unknown as AIService;

   // ❌ WRONG - Using @ts-ignore
   const fakeAI: AI = {
     app: { name: 'DEFAULT' },
     // @ts-ignore
   } as AI;
   ```

4. **Mock function types** (for TypeScript inference):
   ```typescript
   // ✅ CORRECT - Explicit type annotation
   const mockFn = jest
     .fn<() => Promise<{ token: string }>>()
     .mockResolvedValue({ token: 'value' });

   // Format on multiple lines for readability (Prettier requirement)
   ```

5. **Common imports needed**:
   - `jest` - For jest.fn(), jest.spyOn(), etc.
   - `afterEach` - For cleanup
   - `beforeEach` - For setup
   - `afterAll` / `beforeAll` - For suite setup/teardown

**Example complete test file structure:**
```typescript
import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { AI } from '../lib/public-types';
import { VertexAIBackend } from '../lib/backend';

const fakeAI: AI = {
  app: {
    name: 'DEFAULT',
    automaticDataCollectionEnabled: true,
    options: { apiKey: 'key', projectId: 'proj', appId: 'app' },
  } as ReactNativeFirebase.FirebaseApp,
  backend: new VertexAIBackend('us-central1'),
  location: 'us-central1',
};

describe('MyFeature', function () {
  afterEach(function () {
    jest.clearAllMocks();
  });

  it('does something', function () {
    expect(true).toBe(true);
  });

  it('handles async', async function () {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockResolvedValue('result');
    const result = await mockFn();
    expect(result).toBe('result');
  });
});
```

### 5. Integration Tests Location
- **Firebase JS SDK**: Has `integration/` folder with integration tests
- **React Native Firebase**: Has `e2e/` folder for end-to-end tests
- **Reason**: Different testing approaches for web vs mobile

### 6. WebSocket Test Mocking Differences

**Firebase JS SDK WebSocket Tests:**
```typescript
// Uses DOM types available in browser test environment
class MockWebSocket {
  private listeners: Map<string, Set<EventListener>> = new Map();
  
  addEventListener(type: string, listener: EventListener): void {
    // ...
  }
  
  triggerMessage(data: unknown): void {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }
}
```

**React Native Firebase WebSocket Tests:**
```typescript
// Avoids DOM types not available in React Native
class MockWebSocket {
  private listeners: Map<string, Set<(event: any) => void>> = new Map();
  
  addEventListener(type: string, listener: (event: any) => void): void {
    // ...
  }
  
  triggerMessage(data: unknown): void {
    const event = new Event('message');
    (event as any).data = data;
    this.dispatchEvent(event);
  }
}
```

**Key Differences:**
- **EventListener type**: JS SDK uses `EventListener` (DOM type), RN uses `(event: any) => void`
- **MessageEvent**: JS SDK uses `MessageEvent` constructor, RN creates basic `Event` and attaches data property
- **Reason**: DOM types (`EventListener`, `MessageEvent`) are not available in React Native test environment

**When Porting WebSocket Tests:**
- ✅ Replace `EventListener` type with `(event: any) => void`
- ✅ Replace `new MessageEvent()` with `new Event()` + manual data property
- ✅ Keep mock behavior identical, just adapt the types

---

## 🔧 Firebase Component System (INTENTIONAL - Do Not Port)

### Component Registration
**Firebase JS SDK has:**
```typescript
// src/index.ts
_registerComponent(
  new Component(AI_TYPE, factory, ComponentType.PUBLIC).setMultipleInstances(true)
);
registerVersion(name, version);
```

**React Native Firebase does NOT have:**
- Component registration system
- `factory-browser.ts` or `factory-node.ts` files
- `_registerComponent` calls
- Multiple instance management via components

**Reason**: React Native Firebase uses a different initialization pattern without the component system. The `getAI()` function directly returns an AI instance instead of using providers.

### AIService Differences
**Firebase JS SDK AIService:**
- Implements `_FirebaseService` interface
- Has `_delete()` method
- Has `chromeAdapterFactory` constructor parameter
- Has options getter/setter methods
- Uses `Provider<FirebaseAuthInternalName>` and `Provider<AppCheckInternalComponentName>`

**React Native Firebase AIService:**
- Simpler class without `_FirebaseService` interface
- No `_delete()` method
- No `chromeAdapterFactory`
- No options property management
- Direct `FirebaseAuthTypes.Module` and `FirebaseAppCheckTypes.Module` types

**Reason**: Different dependency injection and lifecycle management patterns.

---

## 🌐 Browser-Specific Features (INTENTIONAL - Do Not Port)

### Chrome On-Device AI / Hybrid Mode
**Firebase JS SDK has:**
- `src/methods/chrome-adapter.ts` - Chrome's on-device AI integration
- `src/types/chrome-adapter.ts` - ChromeAdapter interface
- `src/types/language-model.ts` - Chrome Prompt API types
- `HybridParams` type with `mode`, `onDeviceParams`, `inCloudParams`
- `InferenceMode` enum with on-device/in-cloud options
- `getGenerativeModel()` accepts `HybridParams | ModelParams`

**React Native Firebase does NOT have:**
- Any chrome-adapter related files
- HybridParams type
- On-device AI functionality
- `getGenerativeModel()` only accepts `ModelParams`

**Reason**: Chrome's on-device AI is browser-specific and not available in React Native. This is a web-only feature.

### Audio Conversation (startAudioConversation, etc.)
**Firebase JS SDK has:**
- `src/methods/live-session-helpers.ts` – `startAudioConversation`, `AudioConversationController`, `StartAudioConversationOptions`
- Uses Web Audio API (`AudioContext`, `AudioWorkletNode`, `AudioWorkletProcessor`), `navigator.mediaDevices.getUserMedia()`, and `MediaStream` for mic capture and playback

**React Native Firebase does NOT have:**
- `live-session-helpers.ts` or any audio-conversation exports

**Reason**: Audio conversation depends on browser-only APIs (Web Audio API, getUserMedia). React Native has no equivalent; mic and playback use different native modules or libraries. Do not port.

### Browser-Specific APIs Not Used
- No `window` object references (except in comments/docs)
- No `document` object usage (except in JSDoc examples)
- No Service Workers
- No localStorage/sessionStorage
- No Web Components
- No DOM manipulation

**Reason**: React Native doesn't have these browser APIs.

---

## 🔌 Polyfills (UNIQUE TO REACT NATIVE - Do Not Remove)

### React Native Requires Polyfills
**React Native Firebase has:**
```typescript
// lib/polyfills.ts
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';
import { ReadableStream } from 'web-streams-polyfill/dist/ponyfill';
import { fetch, Headers, Request, Response } from 'react-native-fetch-api';
import 'text-encoding'; // TextEncoder/TextDecoder

polyfillGlobal('fetch', ...) // with reactNative: { textStreaming: true }
polyfillGlobal('ReadableStream', ...)
```

**Plus:**
- `lib/types/polyfills.d.ts` - Type declarations for polyfills
- Custom `RequestInit` interface extension for `reactNative.textStreaming`

**Firebase JS SDK does NOT need:**
- Any polyfills (native browser/Node support)
- Special fetch configuration

**Reason**: React Native doesn't have native fetch streaming, ReadableStream, or TextEncoder. These are critical for AI streaming responses.

**IMPORTANT**: When porting new features, ensure they use these polyfilled APIs, not browser-native ones.

---

## 🔌 WebSocket Implementation Differences (INTENTIONAL - Adapt When Porting)

### React Native WebSocket Limitations

**Firebase JS SDK WebSocket Handler:**
```typescript
// src/websocket.ts
connect(url: string): Promise<void> {
  this.ws = new WebSocket(url);
  this.ws.binaryType = 'blob'; // Set binary type to blob
  // ...
}

// Message handler expects Blob
const messageListener = (event: MessageEvent): void => {
  const data = await event.data.text(); // Assumes Blob
  // ...
};
```

**React Native Firebase WebSocket Handler:**
```typescript
// lib/websocket.ts
connect(url: string): Promise<void> {
  this.ws = new WebSocket(url);
  // Note: binaryType is not supported in React Native's WebSocket implementation.
  // We handle ArrayBuffer, Blob, and string data types in the message listener instead.
  // ...
}

// Message handler detects data type dynamically
const messageListener = async (event: any): Promise<void> => {
  let data: string;
  
  if (event.data instanceof Blob) {
    // Browser environment
    data = await event.data.text();
  } else if (event.data instanceof ArrayBuffer) {
    // React Native environment - binary data comes as ArrayBuffer
    const decoder = new TextDecoder('utf-8');
    data = decoder.decode(event.data);
  } else if (typeof event.data === 'string') {
    // String data in all environments
    data = event.data;
  }
  // ...
};
```

**Key Differences:**
1. **No `binaryType` property**: React Native's WebSocket doesn't support setting `binaryType = 'blob'`
2. **ArrayBuffer in RN**: Binary data arrives as `ArrayBuffer` in React Native, not `Blob`
3. **Runtime type detection**: Must check `event.data` type at runtime instead of configuring upfront
4. **TextDecoder usage**: Need to manually decode ArrayBuffer to string using TextDecoder

### WebSocket URL Construction

**Firebase JS SDK:**
```typescript
// Uses standard URL class
const url = new URL(`wss://${domain}/path`);
url.searchParams.set('key', apiKey);
return url.toString();
```

**React Native Firebase:**
```typescript
// lib/requests/request.ts - WebSocketUrl class
toString(): string {
  // Manually construct URL to avoid React Native URL API issues
  const baseUrl = `wss://${DEFAULT_DOMAIN}`;
  const pathname = this.pathname;
  const queryString = `key=${encodeURIComponent(this.apiSettings.apiKey)}`;
  
  return `${baseUrl}${pathname}?${queryString}`;
}
```

**Reason**: 
- React Native has URL API quirks/limitations, so we manually construct WebSocket URLs
- Manual string concatenation is more reliable than URL class in RN environment

### When Porting WebSocket Features

**DO:**
- ✅ Remove or comment out `binaryType` assignments
- ✅ Add runtime type checking for `event.data` (Blob | ArrayBuffer | string)
- ✅ Use TextDecoder for ArrayBuffer conversion
- ✅ Manually construct WebSocket URLs with string concatenation
- ✅ Test on both iOS and Android (they may behave slightly differently)

**DON'T:**
- ❌ Assume `binaryType` can be set
- ❌ Assume binary data will be Blob
- ❌ Use URL class for WebSocket URL construction
- ❌ Remove ArrayBuffer handling code

---

## 📦 Package Dependencies

### Firebase JS SDK Dependencies
```json
{
  "@firebase/app": "0.x",
  "@firebase/component": "0.7.0",
  "@firebase/logger": "0.5.0",
  "@firebase/util": "1.13.0",
  "@firebase/app-check-interop-types": "0.3.3",
  "@firebase/auth-interop-types": "...",
  "tslib": "^2.1.0"
}
```

### React Native Firebase Dependencies
```json
{
  "@react-native-firebase/app": "23.5.0",
  "react-native-fetch-api": "^3.0.0",
  "web-streams-polyfill": "^4.2.0",
  "text-encoding": "^0.7.0"
}
```

**Key Differences:**
- RN uses `@react-native-firebase/app` instead of `@firebase/app`
- RN doesn't use `@firebase/component`, `@firebase/util`, or interop types
- RN has polyfill dependencies
- RN uses `FirebaseAuthTypes` and `FirebaseAppCheckTypes` from their respective RN packages

---

## 🔄 Import Pattern Differences

### Firebase JS SDK Imports
```typescript
import { FirebaseApp, getApp, _getProvider } from '@firebase/app';
import { Provider } from '@firebase/component';
import { getModularInstance } from '@firebase/util';
import { FirebaseAuthInternal } from '@firebase/auth-interop-types';
import { FirebaseAppCheckInternal } from '@firebase/app-check-interop-types';
```

### React Native Firebase Imports
```typescript
import { getApp, ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseAppCheckTypes } from '@react-native-firebase/app-check';
```

**When porting code:**
- Replace `@firebase/*` imports with `@react-native-firebase/*` equivalents
- Replace `FirebaseApp` type with `ReactNativeFirebase.FirebaseApp`
- Remove `Provider`, `Component`, `getModularInstance`, interop types
- Use direct RN module types instead of internal/interop types

---

## 🏗️ Helper Files

### Firebase JS SDK Has
- `src/helpers.ts` - `encodeInstanceIdentifier()`, `decodeInstanceIdentifier()` for component system
- These are used with the component provider system

### React Native Firebase
- Does NOT have `helpers.ts` file
- Doesn't need instance identifier encoding/decoding

**Reason**: No component provider system in RN.

---

## 📋 Public Types & Interface Differences

### AIOptions Interface
**Firebase JS SDK:**
```typescript
export interface AIOptions {
  backend?: Backend;
  useLimitedUseAppCheckTokens?: boolean;
}
```

**React Native Firebase:**
```typescript
export interface AIOptions {
  backend?: Backend;
  useLimitedUseAppCheckTokens?: boolean;
  appCheck?: FirebaseAppCheckTypes.Module | null;
  auth?: FirebaseAuthTypes.Module | null;
}
```

**Difference**: RN version includes `appCheck` and `auth` directly in options because it doesn't use providers.

### AI Interface
**Firebase JS SDK:**
```typescript
export interface AI {
  app: FirebaseApp;
  backend: Backend;
  options?: AIOptions;
  location: string; // deprecated
}
```

**React Native Firebase:**
```typescript
export interface AI {
  app: ReactNativeFirebase.FirebaseApp;
  backend: Backend;
  options?: Omit<AIOptions, 'backend'>;
  location: string;
  appCheck?: FirebaseAppCheckTypes.Module | null;
  auth?: FirebaseAuthTypes.Module | null;
}
```

**Differences**:
- Different app type
- RN includes `appCheck` and `auth` directly
- Options type excludes `backend` in RN

---

## 🚫 Web-Only Entry Points (Do Not Port)

### Node.js Specific Files
**Firebase JS SDK has:**
- `src/index.node.ts` - Node.js specific entry point
- Separate build targets for Node vs Browser

**React Native Firebase:**
- Single entry point (`lib/index.ts`)
- No platform-specific entry points

**Reason**: React Native is a unified mobile runtime, not split between browser/Node like web SDK.

---

## 🎨 Build & Configuration Differences

### Firebase JS SDK
- Uses Rollup for building
- Has `rollup.config.js`
- Has `api-extractor.json` for API documentation
- Multiple export targets (browser, node, esm, cjs)

### React Native Firebase
- Uses `react-native-builder-bob` for building
- Configured in `package.json`
- Outputs to `dist/commonjs/` and `dist/module/`
- TypeScript definitions in `dist/typescript/`

**Reason**: Different build tools and conventions for web vs React Native packages.

---

## ✅ When Porting New Features - Checklist

Use this checklist when identifying new APIs in Firebase JS SDK to port:

### 1. **Identify the Feature**
   - What files are involved in JS SDK?
   - What public APIs are exposed?
   - What types are exported?

### 2. **Check for Browser-Specific Code**
   - ❌ Skip if uses Chrome on-device AI (Hybrid mode, ChromeAdapter)
   - ❌ Skip if uses `window`, `document`, Service Workers
   - ❌ Skip if uses Web-specific APIs unavailable in RN
   - ✅ Proceed if uses only polyfilled APIs (fetch, ReadableStream, TextEncoder)

### 3. **Verify Dependencies**
   - Do all dependencies have RN equivalents?
   - Can it work with the polyfilled environment?
   - Does it need any native modules?

### 4. **Map the Files**
   - `src/` → `lib/`
   - `src/*.test.ts` → `__tests__/*.test.ts`
   - Update imports: `@firebase/*` → `@react-native-firebase/*`

### 5. **Adapt the Implementation**
   - Remove component provider logic
   - Replace Firebase app types with RN types
   - Ensure fetch uses `reactNative: { textStreaming: true }`
   - Remove `_FirebaseService` interface usage
   - Add to `lib/index.ts` exports (not `api.ts`)

### 6. **Update Types**
   - Replace `FirebaseApp` with `ReactNativeFirebase.FirebaseApp`
   - Use direct module types (not interop types)
   - Add any new types to appropriate files in `lib/types/`

### 7. **Verify Polyfills**
   - Ensure it works with polyfilled fetch
   - Ensure it works with polyfilled ReadableStream
   - Test streaming functionality

### 8. **Adapt WebSocket Code** (If applicable)
   - Remove `binaryType` property assignments (not supported in RN)
   - Add runtime type detection for message data (Blob | ArrayBuffer | string)
   - Use TextDecoder for ArrayBuffer to string conversion
   - Manually construct WebSocket URLs (avoid URL class)
   - Test on both iOS and Android

### 9. **Testing** (CRITICAL - Always Port Tests)
   - Port tests from `src/*.test.ts` to `__tests__/*.test.ts`
   - Maintain same file names for easy identification
   - Adapt test utilities for React Native testing environment:
     - Replace Karma/Mocha patterns with Jest
     - Replace browser-specific mocks
     - Use React Native Firebase test utilities
   - **Follow ESLint requirements** (see § 4. ESLint Requirements for Tests):
     - Import Jest globals: `import { describe, expect, it, jest } from '@jest/globals'`
     - Use regular functions, NOT arrow functions for `describe()`/`it()`
     - Cast test objects: `as ReactNativeFirebase.FirebaseApp`
     - Type mock functions: `jest.fn<() => Promise<Type>>()`
   - **Adapt WebSocket test mocks** (see § 6. WebSocket Test Mocking Differences):
     - Replace `EventListener` type with `(event: any) => void`
     - Replace `MessageEvent` with `Event` + manual data property assignment
   - Ensure test coverage matches JS SDK
   - **Verify tests pass linting**: Check with linter before committing
   - Add e2e tests if needed in `e2e/`
   - **Never skip porting tests** - they're critical for maintaining quality

---

## 📝 Example: How to Compare Packages

### Step 1: Compare Exports
```bash
# Check what's exported in JS SDK api.ts
grep "^export" /path/to/firebase-js-sdk/packages/ai/src/api.ts

# Check what's exported in RN index.ts
grep "^export" /path/to/react-native-firebase/packages/ai/lib/index.ts
```

### Step 2: Compare Model Classes
```bash
# List model classes in JS SDK
ls /path/to/firebase-js-sdk/packages/ai/src/models/

# List model classes in RN Firebase
ls /path/to/react-native-firebase/packages/ai/lib/models/
```

### Step 3: Filter Known Differences
- **Ignore** chrome-adapter related differences
- **Ignore** factory files, component registration
- **Ignore** hybrid/on-device features
- **Evaluate** new model classes, methods, types

### Step 4: Identify Real Gaps
Any difference NOT documented in these cursor rules is a potential feature gap.

---

## 🎯 Summary of Known Differences

| Feature | Firebase JS SDK | React Native Firebase | Reason |
|---------|----------------|----------------------|--------|
| **Source Folder** | `src/` | `lib/` | Convention |
| **Entry Point** | `index.ts` + `api.ts` | `index.ts` only | No component system |
| **Tests Location** | `src/` | `__tests__/` | Convention (tests still ported!) |
| **Component Registration** | ✅ Has | ❌ Doesn't have | Different initialization |
| **Factory Files** | ✅ Has | ❌ Doesn't have | No component system |
| **Chrome Adapter** | ✅ Has | ❌ Doesn't have | Browser-only feature |
| **Hybrid Mode** | ✅ Has | ❌ Doesn't have | Browser-only feature |
| **HybridParams** | ✅ Has | ❌ Doesn't have | Browser-only feature |
| **Audio Conversation** (startAudioConversation, etc.) | ✅ Has | ❌ Doesn't have | Web Audio API / getUserMedia not in RN |
| **Polyfills** | ❌ Doesn't need | ✅ Requires | RN environment |
| **Dependencies** | `@firebase/*` | `@react-native-firebase/*` | Different ecosystem |
| **AIService** | Complex (with _FirebaseService) | Simple | Different architecture |
| **Type Files** | chrome-adapter.ts, language-model.ts | polyfills.d.ts | Platform-specific |
| **Node Entry** | ✅ Has index.node.ts | ❌ Doesn't have | Unified runtime |
| **WebSocket binaryType** | ✅ Sets to 'blob' | ❌ Not supported | RN WebSocket limitation |
| **WebSocket Data** | Expects Blob | Runtime detection (Blob/ArrayBuffer/string) | RN sends ArrayBuffer |
| **WebSocket URL** | Uses URL class | Manual string construction | RN URL API issues |
| **WebSocket Test Mocks** | Uses EventListener, MessageEvent | Uses function types, Event + data | DOM types unavailable in RN |

---

## 🔄 Version Tracking

- **Firebase JS SDK Version**: 2.6.0 (as of this comparison)
- **React Native Firebase Version**: 23.5.0
- **Last Comparison Date**: 2025-11-19

When updating, check Firebase JS SDK changelog for new features and re-evaluate what needs porting.

---

## 💡 Tips for AI-Assisted Porting

When asking AI to compare packages:

**Good prompt:**
> "Compare firebase-js-sdk/packages/ai with react-native-firebase/packages/ai. Ignore differences documented in the cursor rules. What new features in JS SDK need to be ported?"

**Bad prompt:**
> "What are all the differences between these packages?"
> (This will list all the intentional differences too)

**Focus areas for comparison:**
- New model classes (e.g., LiveGenerativeModel, TemplateGenerativeModel)
- New methods on existing models
- New types/interfaces for public APIs
- New request/response types
- New exported functions from api.ts

**Ignore for comparison:**
- Component registration code
- Factory files
- Chrome adapter/hybrid features
- Helper files for providers
- Build configuration differences
- Test file locations (but NOT test content - tests must be ported!)
- WebSocket `binaryType` differences (RN uses runtime detection instead)
- WebSocket URL construction methods (RN uses manual string building)
- WebSocket test mock types (RN uses function types, not DOM EventListener/MessageEvent)

---

## 🔄 Incremental Porting Workflow (FOR AI ASSISTANTS)

When asked to port features from Firebase JS SDK to React Native Firebase AI, follow this **incremental, commit-per-feature** approach:

### Core Workflow Rules

1. **ONE feature at a time** - Never implement multiple features in one session
2. **ALWAYS show the plan first** - Present analysis before any implementation
3. **WAIT for approval** - Don't proceed without explicit permission
4. **PAUSE after implementation** - Show changes, then wait for USER to write commit message and commit
5. **RESPECT known differences** - Skip anything documented in this rules file

### Feature Identification Priority

When comparing packages, identify missing features in this order:
1. **High Priority**: Core API functions (getLiveGenerativeModel, etc.)
2. **Medium Priority**: Model classes (LiveGenerativeModel, TemplateGenerativeModel)
3. **Low Priority**: Helper methods, utilities, optimizations

### Implementation Steps (Per Feature)

#### Step 1: Analysis & Proposal
```
Present:
- Feature name and description
- Files involved in JS SDK
- Required adaptations for RN
- Browser-specific checks (skip if found)
- Estimated complexity
- Ask: "Ready to implement?"
```

#### Step 2: Implementation (After Approval Only)
```
Execute:
- Create files in correct locations (src/ → lib/)
- Adapt imports (@firebase/* → @react-native-firebase/*)
- Remove browser-specific code
- Use polyfilled APIs correctly
- Update lib/index.ts exports
- Port tests to __tests__/ (MUST DO - keep same filenames)
- Adapt tests for React Native/Jest environment
```

#### Step 3: Review (USER Commits)
```
Show:
- Summary of all changes
- List of files created/modified
- Any notable adaptations made

Then: WAIT for user to write commit message and commit
Do NOT suggest commit messages
Do NOT proceed to next feature until user says they've committed
```

### Example Interaction Pattern

```
AI: "Found 3 missing features. Start with LiveGenerativeModel (High Priority)?"
User: "yes"

AI: "Analysis: [shows scope] Ready to implement?"
User: "yes"

AI: [implements] "✅ Complete. Changes:
- Created lib/models/live-generative-model.ts
- Created lib/methods/live-session.ts
- Created lib/websocket.ts
- Updated lib/index.ts exports
- Ported __tests__/live-generative-model.test.ts
- Ported __tests__/live-session.test.ts
Review and commit when ready."

User: [reviews, writes commit, commits] "committed"

AI: "Next feature: TemplateGenerativeModel. Proceed?"
```

### Error Handling

If you discover:
- **Browser-specific code**: Stop, explain why, ask for guidance
- **Missing dependencies**: List needed packages, ask for approval
- **Unclear adaptations**: Present options, let user decide

### DO NOT:
- ❌ Implement multiple features at once
- ❌ Proceed without showing the plan
- ❌ Suggest or write commit messages
- ❌ Continue to next feature before user confirms they've committed
- ❌ Skip browser-specific checks
- ❌ Skip porting tests (tests are MANDATORY)

---

## 📚 Related Documentation

- [React Native Firebase AI Documentation](https://rnfirebase.io/ai/usage)
- [Firebase JS SDK AI Package](https://github.com/firebase/firebase-js-sdk/tree/main/packages/ai)
- [React Native Firebase Architecture](https://rnfirebase.io/)

---

**Last Updated**: 2025-11-19
**Maintained By**: React Native Firebase Team

