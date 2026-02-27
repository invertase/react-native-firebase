/**
 * Core comparison logic: diff two export maps and classify each difference
 * as missing / extra / different-shape, then cross-reference against the
 * package config to distinguish documented from undocumented differences.
 */

import type {
  ExportEntry,
  ExportShape,
  FunctionShape,
  InterfaceShape,
  TypeAliasShape,
  VariableShape,
  PackageConfig,
  ComparisonResult,
  MissingEntry,
  ExtraEntry,
  DifferentShapeEntry,
} from './types';

// ---------------------------------------------------------------------------
// Shape serialisation (for human-readable diff output)
// ---------------------------------------------------------------------------

export function shapeToString(shape: ExportShape): string {
  switch (shape.kind) {
    case 'function':
      return `(${shape.params.join(', ')}) => ${shape.returnType}`;
    case 'interface': {
      const members = shape.members
        .map(m => `${m.name}${m.optional ? '?' : ''}: ${m.type}`)
        .join('; ');
      return `{ ${members} }`;
    }
    case 'typeAlias':
      return shape.type;
    case 'variable':
      return shape.type;
  }
}

// ---------------------------------------------------------------------------
// Shape equality
// ---------------------------------------------------------------------------

function functionsMatch(a: FunctionShape, b: FunctionShape): boolean {
  if (a.params.length !== b.params.length) return false;
  if (a.returnType !== b.returnType) return false;
  return a.params.every((p, i) => p === b.params[i]);
}

function interfacesMatch(a: InterfaceShape, b: InterfaceShape): boolean {
  if (a.members.length !== b.members.length) return false;
  const bByName = new Map(b.members.map(m => [m.name, m]));
  return a.members.every(m => {
    const bm = bByName.get(m.name);
    return bm !== undefined && m.type === bm.type && m.optional === bm.optional;
  });
}

function shapesMatch(sdk: ExportShape, rn: ExportShape): boolean {
  if (sdk.kind !== rn.kind) return false;
  switch (sdk.kind) {
    case 'function':
      return functionsMatch(sdk, rn as FunctionShape);
    case 'interface':
      return interfacesMatch(sdk, rn as InterfaceShape);
    case 'typeAlias':
      return sdk.type === (rn as TypeAliasShape).type;
    case 'variable':
      return sdk.type === (rn as VariableShape).type;
  }
}

// ---------------------------------------------------------------------------
// Public comparison function
// ---------------------------------------------------------------------------

export function compare(
  packageName: string,
  sdkExports: Map<string, ExportEntry>,
  rnExports: Map<string, ExportEntry>,
  config: PackageConfig,
): ComparisonResult {
  const nameMapping = config.nameMapping ?? {};
  // Build a reverse map: rnName → sdkName
  const reverseMapping: Record<string, string> = {};
  for (const [sdkName, rnName] of Object.entries(nameMapping)) {
    reverseMapping[rnName] = sdkName;
  }

  const missingInRN: string[] = [];
  const extraInRN: string[] = [];
  const differentShape: Array<{ name: string; sdkShape: string; rnShape: string }> = [];

  // --- Pass 1: firebase-sdk → RN Firebase ---
  for (const [sdkName, sdkEntry] of sdkExports) {
    // Resolve the name this export has in RN Firebase (may be renamed)
    const rnName = nameMapping[sdkName] ?? sdkName;
    const rnEntry = rnExports.get(rnName);

    if (!rnEntry) {
      missingInRN.push(sdkName);
    } else if (!shapesMatch(sdkEntry.shape, rnEntry.shape)) {
      differentShape.push({
        name: sdkName,
        sdkShape: shapeToString(sdkEntry.shape),
        rnShape: shapeToString(rnEntry.shape),
      });
    }
  }

  // --- Pass 2: RN Firebase → firebase-sdk (find extras) ---
  for (const [rnName] of rnExports) {
    // Resolve the name this export has in the firebase-sdk (may be reverse-mapped)
    const sdkName = reverseMapping[rnName] ?? rnName;
    if (!sdkExports.has(sdkName)) {
      extraInRN.push(rnName);
    }
  }

  // --- Cross-reference against config ---
  const docMissing = new Set((config.missingInRN ?? []).map(d => d.name));
  const docExtra = new Set((config.extraInRN ?? []).map(d => d.name));
  const docDiff = new Set((config.differentShape ?? []).map(d => d.name));

  const missingEntries: MissingEntry[] = missingInRN.map(name => ({
    name,
    reason: config.missingInRN?.find(d => d.name === name)?.reason,
  }));

  const extraEntries: ExtraEntry[] = extraInRN.map(name => ({
    name,
    reason: config.extraInRN?.find(d => d.name === name)?.reason,
  }));

  const diffEntries: DifferentShapeEntry[] = differentShape.map(d => ({
    ...d,
    reason: config.differentShape?.find(c => c.name === d.name)?.reason,
  }));

  // --- Stale config entries: documented but no longer a real difference ---
  const actualMissingSet = new Set(missingInRN);
  const actualExtraSet = new Set(extraInRN);
  const actualDiffSet = new Set(differentShape.map(d => d.name));

  const staleConfigMissing = (config.missingInRN ?? [])
    .map(d => d.name)
    .filter(name => !actualMissingSet.has(name));

  const staleConfigExtra = (config.extraInRN ?? [])
    .map(d => d.name)
    .filter(name => !actualExtraSet.has(name));

  const staleConfigDifferentShape = (config.differentShape ?? [])
    .map(d => d.name)
    .filter(name => !actualDiffSet.has(name));

  return {
    packageName,
    missing: missingEntries,
    extra: extraEntries,
    differentShape: diffEntries,
    undocumentedMissing: missingInRN.filter(n => !docMissing.has(n)),
    undocumentedExtra: extraInRN.filter(n => !docExtra.has(n)),
    undocumentedDifferentShape: differentShape
      .map(d => d.name)
      .filter(n => !docDiff.has(n)),
    staleConfigMissing,
    staleConfigExtra,
    staleConfigDifferentShape,
  };
}
