# Feature Porting Workflow

Quick reference guide for porting features from Firebase JS SDK to React Native Firebase AI using AI assistance.

---

## 🎯 Three-Step Process

### **Step 1: Discovery** - What's Missing?
```
Compare Firebase JS SDK AI package with this React Native Firebase AI package.

Context:
- Use /.cursor/rules/ai/ai-package.md to filter known differences
- Focus on missing features, not architectural differences

Instructions:
1. List missing features by priority (High/Medium/Low)
2. Indicate which are portable vs browser-specific
3. Don't implement anything - just list what's missing

Wait for me to choose which feature to port.
```

### **Step 2: Port One Feature** - Incremental Implementation
```
Port [FEATURE_NAME] from Firebase JS SDK:

Phase 1 - Analysis:
- Show files involved in JS SDK
- List required RN adaptations
- Check for browser-specific code
- Estimate complexity
- Ask: "Ready to implement?"

Phase 2 - Implementation (after approval):
- Create files with RN adaptations
- Update lib/index.ts exports
- Port tests to __tests__/ (maintain same filenames, adapt for Jest)
- Show all changes

Phase 3 - Review:
- Summarize changes
- List files created/modified
- Show any notable adaptations
- Wait for me to review, write commit message, and commit

DO NOT suggest commit messages.
DO NOT proceed to next feature until I say I've committed.
```

### **Step 3: Continue** - Next Feature
```
Committed. What's the next missing feature?
```

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

```bash
# User starts
"Let's port missing features from Firebase JS SDK"

# AI responds
"Found 3 missing features:
1. 🔴 LiveGenerativeModel (High) - Real-time API
2. 🟡 TemplateGenerativeModel (Medium) - Server templates
3. ⚪ Hybrid mode helpers (Skip - browser-only)

Start with LiveGenerativeModel?"

# User approves
"yes"

# AI analyzes
"LiveGenerativeModel analysis:
- 3 files: live-generative-model.ts, live-session.ts, websocket.ts
- Uses WebSocket (available in RN) ✓
- No browser dependencies ✓
- Ready to implement?"

# User approves
"yes"

# AI implements and shows changes
"✅ Complete. Changes made:
- Created lib/models/live-generative-model.ts
- Created lib/methods/live-session.ts
- Created lib/websocket.ts
- Updated lib/index.ts exports
- Ported __tests__/live-generative-model.test.ts (adapted for Jest)
- Ported __tests__/live-session.test.ts (adapted for Jest)
- Ported __tests__/websocket.test.ts (adapted for Jest)

Review and commit when ready."

# User reviews, writes commit, and commits
[User reviews changes, writes commit message, commits]
"committed"

# AI continues
"Next: TemplateGenerativeModel. Proceed?"
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

**Quick Start:**

```
Compare packages and list missing features (use cursor rules to filter)
```

Then for each feature:

```
Port [FEATURE]: show plan → wait for approval → implement → show changes → wait for commit
```

That's it! 🚀

