/**
 * Types for the config schema and internal comparison structures.
 */

// ---------------------------------------------------------------------------
// Config schema (per-package config files)
// ---------------------------------------------------------------------------

export interface KnownDifference {
  /** The export name (function, type, interface, etc.) */
  name: string;
  /** Human-readable explanation of why the difference exists. */
  reason: string;
}

export interface PackageConfig {
  /**
   * Maps a firebase-js-sdk export name to its RN Firebase equivalent when the
   * export has been renamed.
   *
   * Key:   firebase-js-sdk name
   * Value: RN Firebase name
   */
  nameMapping?: Record<string, string>;

  /**
   * Exports that are present in the firebase-js-sdk but intentionally absent
   * from the RN Firebase package (e.g. web-only APIs).
   */
  missingInRN?: KnownDifference[];

  /**
   * Exports that are present in the RN Firebase package but not in the
   * firebase-js-sdk (e.g. platform-specific helpers, deprecated APIs).
   */
  extraInRN?: KnownDifference[];

  /**
   * Exports that share the same name in both packages but have a different
   * type signature or shape (e.g. different return type, different member types).
   */
  differentShape?: KnownDifference[];
}

// ---------------------------------------------------------------------------
// Internal shapes — extracted from .d.ts files by ts-morph
// ---------------------------------------------------------------------------

export interface FunctionShape {
  kind: 'function';
  /** Normalized type text for each parameter, in order. */
  params: string[];
  /** Normalized return type text. */
  returnType: string;
}

export interface InterfaceMember {
  name: string;
  /** Normalized type text for the member. */
  type: string;
  optional: boolean;
}

export interface InterfaceShape {
  kind: 'interface';
  members: InterfaceMember[];
}

export interface TypeAliasShape {
  kind: 'typeAlias';
  /** Normalized type text (e.g. `'a' | 'b'`). */
  type: string;
}

export interface VariableShape {
  kind: 'variable';
  /** Normalized type text. */
  type: string;
}

export type ExportShape =
  | FunctionShape
  | InterfaceShape
  | TypeAliasShape
  | VariableShape;

export interface ExportEntry {
  name: string;
  shape: ExportShape;
}

// ---------------------------------------------------------------------------
// Comparison output
// ---------------------------------------------------------------------------

export interface MissingEntry {
  name: string;
  /** Populated when the difference is documented in the config. */
  reason?: string;
}

export interface ExtraEntry {
  name: string;
  reason?: string;
}

export interface DifferentShapeEntry {
  name: string;
  sdkShape: string;
  rnShape: string;
  reason?: string;
}

export interface ComparisonResult {
  packageName: string;
  missing: MissingEntry[];
  extra: ExtraEntry[];
  differentShape: DifferentShapeEntry[];
  /** Names of differences that have NO entry in the config (CI failures). */
  undocumentedMissing: string[];
  undocumentedExtra: string[];
  undocumentedDifferentShape: string[];
  /**
   * Config entries that are no longer needed because the API now matches the
   * firebase-js-sdk. These should be removed from config.ts (CI failures).
   */
  staleConfigMissing: string[];
  staleConfigExtra: string[];
  staleConfigDifferentShape: string[];
}
