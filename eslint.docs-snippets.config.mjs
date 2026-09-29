import * as eslintPluginMdx from 'eslint-plugin-mdx';

/**
 * Narrow ESLint flat config that lints the *code inside* `docs/**\/*.mdx`
 * fenced blocks via eslint-plugin-mdx's `flatCodeBlocks`.
 *
 * Blocking via `yarn lint:markdown` (second eslint invocation) and the
 * Documentation CI job. Kept as a separate config file so
 * `eslintJs.configs.all` from `eslint.config.mjs` is never pointed at
 * doc snippets.
 *
 * Scope is intentionally narrow — only:
 *   - parse errors (inherent to eslint-mdx's remark processor; reported
 *     regardless of rule config, nothing to enable)
 *   - `no-undef`
 *   - `no-unused-vars`
 * eslint-plugin-mdx's own `flatCodeBlocks` preset turns both of those rules
 * OFF by default (`configs/code-blocks.js`) because docs snippets are
 * routinely partial. This file turns them back on, and only those two.
 *
 * Fences whose first non-blank line starts with `// codeblock-ignore` are
 * replaced with a no-op before lint (same opt-out as `yarn docs:tsc:check`).
 * Named example helpers (`function foo()` / `const foo = () =>`) are marked
 * used via a trailing `void (...)` so the teaching wrapper is not reported
 * as dead code; unused imports and unused non-function bindings still fail.
 */

const IGNORE_MARKER = '// codeblock-ignore';

/** Top-level `function name` / `async function name` (optional `export`). */
const TOP_LEVEL_FUNCTION_RE =
  /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\b/gm;
/** Top-level `const name = (…) =>` / `async (…) =>` / `function (…)`. */
const TOP_LEVEL_FN_BINDING_RE =
  /^(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/gm;
const TOP_LEVEL_FN_EXPR_RE =
  /^(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b/gm;

function isMarkerExcluded(blockText) {
  const firstNonBlank = blockText.split('\n').find(l => l.trim().length > 0);
  return Boolean(firstNonBlank && firstNonBlank.trim().startsWith(IGNORE_MARKER));
}

function collectExampleHelperNames(blockText) {
  const names = new Set();
  for (const re of [TOP_LEVEL_FUNCTION_RE, TOP_LEVEL_FN_BINDING_RE, TOP_LEVEL_FN_EXPR_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(blockText)) !== null) {
      names.add(m[1]);
    }
  }
  return [...names];
}

function transformCodeBlockText(blockText) {
  if (isMarkerExcluded(blockText)) {
    return '/* codeblock-ignore: excluded from docs snippet lint */\n';
  }
  const helpers = collectExampleHelperNames(blockText);
  if (helpers.length === 0) {
    return blockText;
  }
  // Keep no-unused-vars from flagging the named helper that *is* the example.
  return `${blockText}\n;void (${helpers.join(', ')});\n`;
}

function createDocsSnippetsProcessor() {
  const base = eslintPluginMdx.createRemarkProcessor({ lintCodeBlocks: true });
  return {
    meta: base.meta,
    supportsAutofix: base.supportsAutofix,
    preprocess(text, filename) {
      const parts = base.preprocess(text, filename);
      return parts.map((part, index) => {
        // Index 0 is the full MDX document; later parts are extracted fences.
        if (index === 0 || typeof part === 'string') {
          return part;
        }
        return {
          ...part,
          text: transformCodeBlockText(part.text),
        };
      });
    },
    postprocess(messages, filename) {
      return base.postprocess(messages, filename);
    },
  };
}

export default [
  {
    name: 'MDX (docs snippets: code-block lint)',
    files: ['**/*.mdx'],
    ...eslintPluginMdx.flat,
    // Explicit processor instance (not the shared `eslintPluginMdx.remark`
    // singleton, whose `lintCodeBlocks` toggle is driven by a mutable
    // module-level side effect keyed off the last-seen `mdx/code-blocks`
    // ESLint setting) so this file's behavior never depends on run order.
    // Wrapped so `// codeblock-ignore` matches `yarn docs:tsc:check` and
    // named example helpers are not reported as unused.
    processor: createDocsSnippetsProcessor(),
  },
  {
    name: 'MDX code blocks (narrow: no-undef + no-unused-vars only)',
    ...eslintPluginMdx.flatCodeBlocks,
    languageOptions: {
      ...eslintPluginMdx.flatCodeBlocks.languageOptions,
      parserOptions: {
        ...eslintPluginMdx.flatCodeBlocks.languageOptions.parserOptions,
        // Docs fences are routinely JSX (```jsx, or ```js containing JSX) —
        // without this, JSX syntax surfaces as a parse error rather than the
        // no-undef/no-unused-vars signal this config exists to give.
        ecmaFeatures: { jsx: true },
      },
      // Runtime globals that legitimately appear undeclared in doc snippets
      // (no import/require shown in the fence, by design, since the fence
      // is illustrating a narrower API). Kept to exactly what shows up
      // across the current docs/**/*.mdx corpus, not a full Node/browser
      // environment preset, so genuinely undeclared identifiers in a
      // snippet still trip no-undef.
      globals: {
        console: 'readonly', // logging in almost every snippet
        __DEV__: 'readonly', // React Native's dev/prod flag
        fetch: 'readonly', // browser/RN fetch API used in a few examples
        require: 'readonly', // CommonJS Cloud Functions / Node server snippets
        exports: 'writable', // CommonJS Cloud Functions / Node server snippets
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
