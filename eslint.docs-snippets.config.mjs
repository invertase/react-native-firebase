import * as eslintPluginMdx from 'eslint-plugin-mdx';

/**
 * Narrow, opt-in ESLint flat config that lints the *code
 * inside* `docs/**\/*.mdx` fenced blocks via eslint-plugin-mdx's
 * `flatCodeBlocks`.
 *
 * Staged, not blocking. Deliberately NOT part of the default `eslint.config.mjs`
 * export and NOT wired into `yarn lint:markdown` (or `yarn lint`, `yarn lint:all`,
 * any CI workflow) — `yarn lint:markdown` only ever loads `eslint.config.mjs`,
 * never this file, so its output is unaffected by this file's existence. There
 * is no package.json script for this config either; run it explicitly:
 *
 *   yarn eslint --config eslint.docs-snippets.config.mjs "docs/**\/*.mdx"
 *
 * Scope is intentionally narrow — only:
 *   - parse errors (inherent to eslint-mdx's remark processor; reported
 *     regardless of rule config, nothing to enable)
 *   - `no-undef`
 *   - `no-unused-vars`
 * eslint-plugin-mdx's own `flatCodeBlocks` preset turns both of those rules
 * OFF by default (`configs/code-blocks.js`) because docs snippets are
 * routinely partial. This file turns them back on, and only those two —
 * not the full JS ruleset from `eslint.config.mjs` (`eslintJs.configs.all`
 * would flood on illustrative docs code that isn't meant to be complete).
 *
 * A future phase will decide whether/how to promote this to blocking
 * once the docs corpus has been rewritten. Do not wire this
 * into `yarn lint:markdown` before then.
 */
export default [
  {
    name: 'MDX (docs snippets: code-block lint staging)',
    files: ['**/*.mdx'],
    ...eslintPluginMdx.flat,
    // Explicit processor instance (not the shared `eslintPluginMdx.remark`
    // singleton, whose `lintCodeBlocks` toggle is driven by a mutable
    // module-level side effect keyed off the last-seen `mdx/code-blocks`
    // ESLint setting) so this file's behavior never depends on run order.
    processor: eslintPluginMdx.createRemarkProcessor({ lintCodeBlocks: true }),
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
      'no-unused-vars': 'error',
    },
  },
];
