import eslintTypescriptParser from '@typescript-eslint/parser';
import * as eslintPluginMdx from 'eslint-plugin-mdx';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginTypescript from 'typescript-eslint';

import { isMarkerExcluded } from './scripts/lib/mdx-fences.mjs';

/**
 * Narrow ESLint flat config that lints the *code inside* `docs/**\/*.mdx`
 * fenced blocks via eslint-plugin-mdx's `flatCodeBlocks`.
 *
 * Blocking via `yarn lint:markdown` (second eslint invocation) and the
 * Documentation CI job. Kept as a separate config file so
 * `eslintJs.configs.all` from `eslint.config.mjs` is never pointed at
 * doc snippets.
 *
 * Which checker owns which class of error (`yarn docs:tsc:check` is the other
 * half; see scripts/docs-snippets-tsc.mjs):
 *   - This lint: parse errors, unused bindings (`no-unused-vars`), and
 *     undeclared names (`no-undef`, which also flags undeclared `<Component />`
 *     tags) in `js` / `javascript` / `jsx` fences. For `ts` / `tsx` fences it
 *     runs the TypeScript parser, `@typescript-eslint/no-unused-vars` and
 *     `react/jsx-no-undef`; plain `no-undef` is OFF there because it
 *     false-positives on types and lib globals.
 *   - `docs:tsc:check`: type errors, unresolved imports, and (for ts/tsx) the
 *     undeclared names this lint does not check. It does NOT report unused
 *     locals and does NOT run strict null / implicit-any checks.
 * ESLint only lints a fence whose virtual file name matches a `files` glob
 * with an explicit extension, so the globs below list js/jsx/ts/tsx on
 * purpose (a bare `**\/*.mdx/**` glob silently skipped jsx, ts and tsx).
 *
 * Scope is intentionally narrow, only:
 *   - parse errors (inherent to eslint-mdx's remark processor; reported
 *     regardless of rule config, nothing to enable)
 *   - `no-undef` (`react/jsx-no-undef` for ts/tsx fences)
 *   - `no-unused-vars` (`react/jsx-uses-vars` marks components used in JSX)
 * eslint-plugin-mdx's own `flatCodeBlocks` preset turns the first two rules
 * OFF by default (`configs/code-blocks.js`) because docs snippets are
 * routinely partial. This file turns them back on, and only those.
 *
 * Fences whose first non-blank line starts with `// codeblock-ignore` are
 * replaced with a no-op before lint (same opt-out as `yarn docs:tsc:check`;
 * the marker check is `isMarkerExcluded` from `scripts/lib/mdx-fences.mjs`,
 * the source of truth shared with the scripts). Fences inside a blockquote are
 * linted here by the remark processor, while the scripts reject them with an
 * error, so such a fence cannot hide from `docs:tsc:check`.
 * Named example helpers (`function foo()`, `const foo = () =>`, and the typed
 * or generic arrow forms `const foo = (a: T): R =>`, `const foo: F = () =>`,
 * `const foo = <T,>(x: T) =>`) are marked used via a trailing `void (...)` so
 * the teaching wrapper is not reported as dead code; unused imports and
 * unused non-function bindings fail.
 */

/** Top-level `function name` / `async function name` (optional `export`). */
const TOP_LEVEL_FUNCTION_RE = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\b/gm;
/**
 * Top-level `const name = (…) =>` / `async (…) =>` / `x =>`, with optional
 * variable annotation (`const h: H = …`), generic parameters (`<T,>(x: T) =>`)
 * and return type (`(a: number): number =>`). Annotations may contain `=>`
 * (`const h: () => void = () => {}`); they and return types are matched on one
 * line without a bare `=` or `;`.
 */
const TOP_LEVEL_FN_BINDING_RE =
  /^(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*(?::(?:[^=;\n]|=>)+?)?\s*=\s*(?:async\s*)?(?:<[^>\n]*>\s*)?(?:\([^)]*\)(?:\s*:[^=;\n]+?)?|[A-Za-z_$][\w$]*)\s*=>/gm;
/** Top-level `const name = function …` (optionally annotated). */
const TOP_LEVEL_FN_EXPR_RE =
  /^(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*(?::(?:[^=;\n]|=>)+?)?\s*=\s*(?:async\s+)?function\b/gm;

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

const UNUSED_VARS_OPTIONS = {
  argsIgnorePattern: '^_',
  varsIgnorePattern: '^_',
  caughtErrorsIgnorePattern: '^_',
  ignoreRestSiblings: true,
};

// Components used only inside JSX, and `import React from 'react'` (the
// classic JSX pragma), count as used (`no-unused-vars`).
const JSX_USES_VARS_RULE = {
  'react/jsx-uses-vars': 'error',
  'react/jsx-uses-react': 'error',
};

function codeBlockLanguageOptions() {
  return {
    ...eslintPluginMdx.flatCodeBlocks.languageOptions,
    parserOptions: {
      ...eslintPluginMdx.flatCodeBlocks.languageOptions.parserOptions,
      // Docs fences are routinely JSX (```jsx, or ```js containing JSX);
      // without this, JSX syntax surfaces as a parse error rather than the
      // no-undef/no-unused-vars signal this config exists to give.
      ecmaFeatures: { jsx: true },
    },
    // Runtime globals that legitimately appear undeclared in doc snippets
    // (no import/require shown in the fence, by design, since the fence
    // is illustrating a narrower API). Limited to what the docs/**/*.mdx
    // corpus needs, not a full Node/browser environment preset, so genuinely
    // undeclared identifiers in a snippet trip no-undef.
    globals: {
      console: 'readonly', // logging in almost every snippet
      __DEV__: 'readonly', // React Native's dev/prod flag
      fetch: 'readonly', // browser/RN fetch API used in a few examples
      require: 'readonly', // CommonJS Cloud Functions / Node server snippets
      exports: 'writable', // CommonJS Cloud Functions / Node server snippets
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
    name: 'MDX code blocks: js/jsx (narrow: no-undef + no-unused-vars only)',
    ...eslintPluginMdx.flatCodeBlocks,
    files: ['**/*.{md,mdx}/**/*.{js,jsx}'],
    plugins: { react: eslintPluginReact },
    languageOptions: codeBlockLanguageOptions(),
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', UNUSED_VARS_OPTIONS],
      ...JSX_USES_VARS_RULE,
    },
  },
  {
    // ts/tsx fences: tsc (docs:tsc:check) owns undeclared names and types, so
    // core `no-undef` stays off; unused bindings are checked with the
    // TypeScript-aware rule so type-only imports are not misreported.
    name: 'MDX code blocks: ts/tsx (narrow: unused vars + JSX tags)',
    ...eslintPluginMdx.flatCodeBlocks,
    files: ['**/*.{md,mdx}/**/*.{ts,tsx}'],
    plugins: { react: eslintPluginReact, '@typescript-eslint': eslintPluginTypescript.plugin },
    languageOptions: {
      ...codeBlockLanguageOptions(),
      parser: eslintTypescriptParser,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', UNUSED_VARS_OPTIONS],
      // `no-undef` is off here, so undeclared `<Foo />` tags need this rule.
      'react/jsx-no-undef': 'error',
      ...JSX_USES_VARS_RULE,
    },
  },
];
