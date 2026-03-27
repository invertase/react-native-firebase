# Feature Porting Workflow

Quick reference guide for using the local AI type snapshot and compare-types script to spot AI feature gaps, then port them into React Native Firebase incrementally.

---

## 🚀 Quick Start

**To begin porting, use this command:**

```
Follow @porting-workflow.md

Start at Step 1: Discovery
```

The workflow will:
1. Review `ai-package.md` and the AI compare-types config
2. Run `yarn compare:types` and focus on the `ai` package output
3. Guide you through porting one feature at a time

---

## 🎯 Three-Step Process

### **Step 1: Discovery** - What's Missing?

**Before discovery:**

1. Ensure `.github/scripts/compare-types/packages/ai/firebase-sdk.d.ts` contains the latest firebase-js-sdk AI public type snapshot
2. Review `.github/scripts/compare-types/packages/ai/config.ts` for documented differences

**Then execute the following:**

Run `yarn compare:types` from the repo root and analyze the `ai` package output.

**Instructions:**
1. Read `/.cursor/rules/ai/ai-package.md` to understand known platform differences
2. Read `.github/scripts/compare-types/packages/ai/config.ts` to understand documented type drift
3. Run `yarn compare:types`
4. Categorize undocumented `ai` findings by priority:
   - 🔴 **HIGH**: Core API functions or entry points
   - 🟡 **MEDIUM**: Model classes, sessions, request/response types
   - 🟢 **LOW**: Helpers, utilities, or non-blocking type refinements
   - ⚪ **SKIP**: Browser-only features or intentional architecture differences
5. For each candidate gap, specify:
   - Feature name
   - Compare-types category (`Missing in RN Firebase`, `Different shape`, or `STALE`)
   - Portability (portable vs browser-specific)
   - Likely RN files involved
   - Brief description

**Output format:**
```
Found X AI gaps:

🔴 HIGH PRIORITY:
1. [Feature] - [Description] (portable/browser-specific)
   Compare-types: [category]
   RN files: [list]

🟡 MEDIUM PRIORITY:
1. [Feature] - [Description] (portable/browser-specific)
   Compare-types: [category]
   RN files: [list]

🟢 LOW PRIORITY:
...

⚪ SKIP (Browser-only / intentional):
1. [Feature] - [Reason]
```

Then ask: "Which feature would you like to port first?"

### **Step 2: Port One Feature** - Incremental Implementation

**When user says "port [FEATURE_NAME]" or selects a feature, execute:**

#### **Phase 1 - Analysis**

Analyze the feature for porting:

1. **Compare-types evidence:**
   - Quote the relevant `ai` package findings
   - Identify whether the gap is a missing export, a type-shape mismatch, or stale config

2. **Likely RN files involved:**
   - List the RN source files and tests you expect to update
   - Map public exports to `lib/` and `__tests__/`

3. **Required RN adaptations:**
   - Import changes (`@firebase/*` → `@react-native-firebase/*`)
   - Type changes (`FirebaseApp` → `ReactNativeFirebase.FirebaseApp`)
   - Polyfill requirements (fetch, ReadableStream, TextEncoder)
   - Component system removal (if applicable)

4. **Browser-specific checks:**
   - Scan for `window`, `document`, DOM APIs
   - Check for Service Workers, localStorage, or browser audio APIs
   - Identify if Chrome adapter, Hybrid mode, or other web-only features are involved

5. **Complexity estimate:**
   - Low: Simple type/export update
   - Medium: Multiple files, some adaptations needed
   - High: Complex dependencies, significant runtime changes

6. **Dependencies and references:**
   - List any new packages needed
   - Verify RN compatibility
   - Do not assume the firebase-js-sdk repo is available locally
   - If implementation details beyond the type snapshot are required, ask the user for the relevant source/context before proceeding

**Then ask:** "Ready to implement? (yes/no)"

#### **Phase 2 - Implementation** (After user approval only)

Execute these steps:

1. **Create or update source files:**
   - Add or update the RN implementation in `lib/`
   - Apply all adaptations from Phase 1
   - Ensure polyfills are used correctly

2. **Update exports:**
   - Add to `lib/index.ts`
   - Add types to `lib/public-types.ts` if needed

3. **Port tests:**
   - Port or add tests in `__tests__/`
   - Keep equivalent file naming where possible
   - Use Jest-compatible patterns
   - Ensure coverage matches the intended feature

4. **Show all changes:**
   - List every file created/modified
   - Note key adaptations made

#### **Phase 3 - Review** (USER commits)

1. **Summarize:**
   ```
   ✅ Complete. Changes made:

   Source files:
   - Created/updated lib/[...]

   Test files:
   - Ported/updated __tests__/[...]

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
4. If user says no or picks a different feature, go to Step 2 with their choice
5. If all features are done, summarize what was ported

---

## ✅ Quality Checklist (Before Committing)

- [ ] `.github/scripts/compare-types/packages/ai/firebase-sdk.d.ts` is up to date for discovery
- [ ] All imports updated (`@firebase/*` → `@react-native-firebase/*`) where applicable
- [ ] Polyfills used correctly (fetch, ReadableStream, TextEncoder)
- [ ] No browser-specific APIs (`window`, `document`, etc.)
- [ ] Exports added to `lib/index.ts`
- [ ] Types exported from `lib/public-types.ts` if needed
- [ ] Tests added or updated in `__tests__/`
- [ ] Test coverage matches the intended feature
- [ ] Files are in the correct RN locations (`lib/`, `__tests__/`)

---

## 🚦 Example Session

```
USER: Follow @porting-workflow.md
      Start at Step 1: Discovery

AI: [Reads ai-package.md, reviews ai config, runs compare-types]

    Found 3 AI gaps:

    🔴 HIGH PRIORITY:
    1. Live API (getLiveGenerativeModel, LiveGenerativeModel, LiveSession)
       - Real-time bidirectional communication via WebSocket
       - Compare-types: Missing in RN Firebase
       - RN files: lib/index.ts, lib/models/live-generative-model.ts,
                   lib/methods/live-session.ts, lib/websocket.ts
       - Portable ✓

    🟡 MEDIUM PRIORITY:
    1. Template Models (getTemplateGenerativeModel, TemplateGenerativeModel)
       - Server-side template execution
       - Compare-types: Missing in RN Firebase
       - RN files: lib/index.ts, lib/models/template-generative-model.ts
       - Portable ✓

    ⚪ SKIP (Browser-only / intentional):
    1. Hybrid Mode - Chrome on-device AI (not available in RN)

    Which feature would you like to port first?

USER: Live API

AI: [Phase 1 - Analysis]

    Live API Analysis:

    Compare-types evidence:
    - Missing in RN Firebase: getLiveGenerativeModel
    - Missing in RN Firebase: LiveGenerativeModel
    - Missing in RN Firebase: LiveSession

    RN files involved:
    - lib/index.ts
    - lib/models/live-generative-model.ts
    - lib/methods/live-session.ts
    - lib/websocket.ts
    - lib/types/live-responses.ts
    - __tests__/live-generative-model.test.ts
    - __tests__/live-session.test.ts

    Required adaptations:
    - Import: @firebase/app → @react-native-firebase/app
    - WebSocket: Native API available in RN ✓
    - Polyfills: Uses fetch (already polyfilled) ✓

    Browser-specific checks:
    - No window/document usage ✓
    - WebSocket is native in RN ✓

    Complexity: Medium-High

    Ready to implement? (yes/no)
```

---

## 🎯 Key Principles

1. **One feature = One commit** - clean git history
2. **Show before doing** - always present the plan first
3. **Wait for approval** - user stays in control
4. **Use compare-types first** - discovery starts from the local AI snapshot, not a checked-out firebase-js-sdk repo
5. **Respect known differences** - don't port browser-specific or intentionally divergent APIs

---

## 📚 Related Files

- `/.cursor/rules/ai/ai-package.md` - Known differences and parity rules
- `/.cursor/rules/ai/porting-workflow.md` - This file
- `.github/scripts/compare-types/packages/ai/firebase-sdk.d.ts` - Local firebase-js-sdk AI type snapshot
- `.github/scripts/compare-types/packages/ai/config.ts` - Documented AI type differences

---

## 📝 Usage Summary

**Single command to start:**

```
Follow @porting-workflow.md

Start at Step 1: Discovery
```

**The AI will:**
- ✅ Read the porting rules automatically
- ✅ Run the AI compare-types workflow
- ✅ List undocumented gaps by priority
- ✅ Guide you through porting one feature at a time
- ✅ Wait for your approval at each step

**You control:**
- Which features to port
- When to proceed with implementation
- Commit messages and timing

That's it! 🚀

