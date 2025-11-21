# Feature Porting Workflow

Quick reference guide for porting features from Firebase JS SDK to React Native Firebase AI using AI assistance.

---

## 🚀 Quick Start

**To begin porting, use this command:**

```
Follow @porting-workflow.md

Firebase JS SDK location: [YOUR_PATH]/firebase-js-sdk/packages/ai

Start at Step 1: Discovery
```

The workflow will:
1. Compare packages using rules from `ai-package.md`
2. List missing features by priority
3. Guide you through porting one feature at a time

---

## 🎯 Three-Step Process

### **Step 1: Discovery** - What's Missing?

**When user provides Firebase JS SDK path, execute the following:**

Compare Firebase JS SDK AI package with React Native Firebase AI package.

**Paths:**
- Firebase JS SDK: [user-provided path]
- React Native Firebase: Current workspace `packages/ai/`

**Instructions:**
1. Read `/.cursor/rules/ai/ai-package.md` to understand known differences
2. Compare the packages and identify missing features
3. Categorize by priority:
   - 🔴 **HIGH**: Core API functions (e.g., getLiveGenerativeModel, getTemplateGenerativeModel)
   - 🟡 **MEDIUM**: Model classes (e.g., LiveGenerativeModel, TemplateGenerativeModel)
   - 🟢 **LOW**: Helper methods, utilities, optimizations
   - ⚪ **SKIP**: Browser-specific features (Chrome adapter, Hybrid mode)
4. For each missing feature, specify:
   - Feature name
   - Portability (portable vs browser-specific)
   - Files involved in JS SDK
   - Brief description

**Output format:**
```
Found X missing features:

🔴 HIGH PRIORITY:
1. [Feature] - [Description] (portable/browser-specific)
   Files: [list]

🟡 MEDIUM PRIORITY:
1. [Feature] - [Description] (portable/browser-specific)
   Files: [list]

🟢 LOW PRIORITY:
...

⚪ SKIP (Browser-only):
1. [Feature] - [Reason]
```

Then ask: "Which feature would you like to port first?"

### **Step 2: Port One Feature** - Incremental Implementation

**When user says "port [FEATURE_NAME]" or selects a feature, execute:**

#### **Phase 1 - Analysis**

Analyze the feature for porting:

1. **Files involved in JS SDK:**
   - List all source files
   - List all test files

2. **Required RN adaptations:**
   - Import changes (`@firebase/*` → `@react-native-firebase/*`)
   - Type changes (`FirebaseApp` → `ReactNativeFirebase.FirebaseApp`)
   - Polyfill requirements (fetch, ReadableStream, TextEncoder)
   - Component system removal (if applicable)

3. **Browser-specific checks:**
   - Scan for `window`, `document`, DOM APIs
   - Check for Service Workers, localStorage
   - Identify if Chrome adapter or Hybrid mode related

4. **Complexity estimate:**
   - Low: Simple file port, minimal changes
   - Medium: Multiple files, some adaptations needed
   - High: Complex dependencies, significant adaptations

5. **Dependencies:**
   - List any new packages needed
   - Verify RN compatibility

**Then ask:** "Ready to implement? (yes/no)"

#### **Phase 2 - Implementation** (After user approval only)

Execute these steps:

1. **Create source files:**
   - Port from `src/` to `lib/`
   - Apply all adaptations from Phase 1
   - Ensure polyfills are used correctly

2. **Update exports:**
   - Add to `lib/index.ts`
   - Add types to `lib/public-types.ts` if needed

3. **Port tests:**
   - Port from `src/*.test.ts` to `__tests__/*.test.ts`
   - Keep identical filenames
   - Convert Mocha/Chai to Jest
   - Remove browser-specific test utilities
   - Ensure coverage matches JS SDK

4. **Show all changes:**
   - List every file created/modified
   - Note key adaptations made

#### **Phase 3 - Review** (USER commits)

1. **Summarize:**
   ```
   ✅ Complete. Changes made:

   Source files:
   - Created lib/[...]
   - Updated lib/index.ts

   Test files:
   - Ported __tests__/[...] (adapted for Jest)

   Key adaptations:
   - [List any notable changes]
   ```

2. **Wait for user:**
   - Say: "Review and commit when ready."
   - Do NOT suggest commit messages
   - Do NOT proceed to next feature
   - Wait for user to say "committed" or similar

### **Step 3: Continue** - Next Feature

**When user says "committed", "next", or similar:**

1. Reference the original discovery list
2. Ask: "Next feature: [FEATURE_NAME] (Priority: [HIGH/MEDIUM/LOW]). Proceed?"
3. If user says yes, go to Step 2 with that feature
4. If user says no or picks different feature, go to Step 2 with their choice
5. If all features done, congratulate and summarize what was ported

---

## ✅ Quality Checklist (Before Committing)

- [ ] All imports updated (`@firebase/*` → `@react-native-firebase/*`)
- [ ] Polyfills used correctly (fetch, ReadableStream, TextEncoder)
- [ ] No browser-specific APIs (`window`, `document`, etc.)
- [ ] Exports added to `lib/index.ts`
- [ ] Types exported from `lib/public-types.ts` if needed
- [ ] Tests ported to `__tests__/` with same filenames
- [ ] Tests adapted for Jest (from Karma/Mocha)
- [ ] Test coverage matches JS SDK
- [ ] Files in correct locations (`src/` → `lib/`)

---

## 🚦 Example Session

```
USER: Follow @porting-workflow.md
      Firebase JS SDK location: /Users/me/firebase-js-sdk/packages/ai
      Start at Step 1: Discovery

AI: [Reads ai-package.md rules, compares packages]

    Found 3 missing features:

    🔴 HIGH PRIORITY:
    1. Live API (getLiveGenerativeModel, LiveGenerativeModel, LiveSession)
       - Real-time bidirectional communication via WebSocket
       - Files: src/api.ts, src/models/live-generative-model.ts,
                src/methods/live-session.ts, src/websocket.ts
       - Portable ✓

    🟡 MEDIUM PRIORITY:
    1. Template Models (getTemplateGenerativeModel, TemplateGenerativeModel)
       - Server-side template execution
       - Files: src/api.ts, src/models/template-generative-model.ts
       - Portable ✓

    ⚪ SKIP (Browser-only):
    1. Hybrid Mode - Chrome on-device AI (not available in RN)

    Which feature would you like to port first?

USER: Live API

AI: [Phase 1 - Analysis]

    Live API Analysis:

    Files involved:
    - src/api.ts (add getLiveGenerativeModel export)
    - src/models/live-generative-model.ts
    - src/methods/live-session.ts, live-session-helpers.ts
    - src/websocket.ts
    - src/types/live-responses.ts
    - Tests: 3 test files

    Required adaptations:
    - Import: @firebase/app → @react-native-firebase/app
    - WebSocket: Native API available in RN ✓
    - Polyfills: Uses fetch (already polyfilled) ✓

    Browser-specific checks:
    - No window/document usage ✓
    - WebSocket is native in RN ✓

    Complexity: Medium-High (multiple files, WebSocket handling)

    Ready to implement? (yes/no)

USER: yes

AI: [Phase 2 - Implementation]
    [Creates all files...]

    ✅ Complete. Changes made:

    Source files:
    - Created lib/models/live-generative-model.ts
    - Created lib/methods/live-session.ts
    - Created lib/methods/live-session-helpers.ts
    - Created lib/websocket.ts
    - Created lib/types/live-responses.ts
    - Updated lib/index.ts (added getLiveGenerativeModel, LiveGenerativeModel exports)

    Test files:
    - Ported __tests__/live-generative-model.test.ts (adapted for Jest)
    - Ported __tests__/live-session.test.ts (adapted for Jest)
    - Ported __tests__/websocket.test.ts (adapted for Jest)

    Key adaptations:
    - Changed imports from @firebase/* to @react-native-firebase/*
    - Removed component provider logic
    - WebSocket uses native RN WebSocket API

    Review and commit when ready.

USER: [reviews code, writes commit message, commits]
      committed

AI: Next feature: Template Models (Priority: MEDIUM). Proceed?

USER: yes

[Process repeats...]
```

---

## 🎯 Key Principles

1. **One feature = One commit** - Clean git history
2. **Show before doing** - Always present plan first
3. **Wait for approval** - User stays in control
4. **Pause between features** - Time to review and commit
5. **Respect known differences** - Don't port browser-specific code

---

## 📚 Related Files

- `/.cursor/rules/ai/ai-package.md` - Known differences and porting rules
- `/.cursor/rules/ai/porting-workflow.md` - This file
- `README.md` - Package documentation

---

## 📝 Usage Summary

**Single command to start:**

```
Follow @porting-workflow.md

Firebase JS SDK location: [YOUR_PATH]/firebase-js-sdk/packages/ai

Start at Step 1: Discovery
```

**The AI will:**
- ✅ Read the porting rules automatically
- ✅ Compare packages and list missing features
- ✅ Guide you through porting one feature at a time
- ✅ Wait for your approval at each step
- ✅ Pause after each feature for you to commit

**You control:**
- Which features to port
- When to proceed with implementation
- Commit messages and timing

That's it! 🚀

