// No-op for ios. Avoid binding name `module` (Jest runs TS in a CJS context).
const noopNativeModule: Record<string, never> = {};

export default noopNativeModule;
