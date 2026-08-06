import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from '@jest/globals';
import {
  PIPELINE_SOURCE_TYPES,
  PIPELINE_STAGE_TYPES,
  PIPELINE_UNSUPPORTED_BASE_MESSAGE,
  createPipelineUnsupportedMessage,
} from '../lib/pipelines/pipeline_support';

const ROOT = process.cwd();
const ANDROID_EXECUTOR_PATH = join(
  ROOT,
  'packages/firestore/android/src/reactnative/java/io/invertase/firebase/firestore/ReactNativeFirebaseFirestorePipelineParser.java',
);
const ANDROID_NODE_BUILDER_PATH = join(
  ROOT,
  'packages/firestore/android/src/reactnative/java/io/invertase/firebase/firestore/ReactNativeFirebaseFirestorePipelineNodeBuilder.java',
);
const IOS_EXECUTOR_PATH = join(
  ROOT,
  'packages/firestore/ios/RNFBFirestore/RNFBFirestorePipelineParser.swift',
);
const IOS_NODE_BUILDER_PATH = join(
  ROOT,
  'packages/firestore/ios/RNFBFirestore/RNFBFirestorePipelineNodeBuilder.swift',
);

function extractJavaMethod(source: string, signature: string, nextSignature: string): string {
  const start = source.indexOf(signature);
  if (start === -1) {
    throw new Error(`Could not find Java method "${signature}".`);
  }
  const end = source.indexOf(nextSignature, start + signature.length);
  if (end === -1) {
    throw new Error(`Could not find end marker "${nextSignature}" for "${signature}".`);
  }
  return source.slice(start, end);
}

function extractSwiftFunction(source: string, signature: string, nextSignature: string): string {
  const start = source.indexOf(signature);
  if (start === -1) {
    throw new Error(`Could not find Swift function "${signature}".`);
  }
  const end = source.indexOf(nextSignature, start + signature.length);
  if (end === -1) {
    throw new Error(`Could not find end marker "${nextSignature}" for "${signature}".`);
  }
  return source.slice(start, end);
}

function extractQuotedList(source: string, marker: string, endMarker: string): string[] {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Could not find marker "${marker}".`);
  }

  const end = source.indexOf(endMarker, markerIndex);
  if (end === -1) {
    throw new Error(`Could not find end marker "${endMarker}" for "${marker}".`);
  }

  const content = source.slice(markerIndex, end);
  const matches = content.match(/"([^"]+)"/g) ?? [];
  return matches.map(match => match.slice(1, -1));
}

describe('Firestore pipeline native parity', function () {
  it('keeps Android and iOS supported source/stage matrices aligned', function () {
    const androidSource = readFileSync(ANDROID_EXECUTOR_PATH, 'utf8');
    const iosSource = readFileSync(IOS_EXECUTOR_PATH, 'utf8');

    const androidSources = extractQuotedList(androidSource, 'SOURCE_TYPES', '));');
    const iosSources = extractQuotedList(iosSource, 'sourceTypes', ']');
    const androidStages = extractQuotedList(androidSource, 'KNOWN_STAGES', '));');
    const iosStages = extractQuotedList(iosSource, 'knownStages', ']');

    expect(androidSources).toEqual([...PIPELINE_SOURCE_TYPES]);
    expect(iosSources).toEqual([...PIPELINE_SOURCE_TYPES]);
    expect(androidStages).toEqual([...PIPELINE_STAGE_TYPES]);
    expect(iosStages).toEqual([...PIPELINE_STAGE_TYPES]);
  });

  it('keeps unsupported message contract deterministic for non-native fallback paths', function () {
    const androidSource = readFileSync(ANDROID_EXECUTOR_PATH, 'utf8');
    const iosSource = readFileSync(IOS_EXECUTOR_PATH, 'utf8');

    expect(androidSource).not.toContain(PIPELINE_UNSUPPORTED_BASE_MESSAGE);
    expect(iosSource).not.toContain(PIPELINE_UNSUPPORTED_BASE_MESSAGE);

    expect(createPipelineUnsupportedMessage()).toBe(PIPELINE_UNSUPPORTED_BASE_MESSAGE);
    expect(
      createPipelineUnsupportedMessage({
        source: { source: 'collection', path: 'firestore/items' },
        stages: [{ stage: 'limit', options: { limit: 1 } }],
      } as any),
    ).toBe(`${PIPELINE_UNSUPPORTED_BASE_MESSAGE} Unsupported stage: limit.`);
    expect(
      createPipelineUnsupportedMessage({
        source: { source: 'documents', documents: ['firestore/items/a'] },
        stages: [],
      } as any),
    ).toBe(`${PIPELINE_UNSUPPORTED_BASE_MESSAGE} Unsupported source: documents.`);
  });

  it('documents iOS-only rejection for pipeline execute and source options', function () {
    const iosSource = readFileSync(IOS_EXECUTOR_PATH, 'utf8');

    expect(iosSource).toContain('does not support options.indexMode on iOS');
    expect(iosSource).toContain('does not support options.rawOptions on iOS');
    expect(iosSource).toContain('does not support pipeline.source.rawOptions');
  });

  it('keeps arrayFirst, arrayFirstN, and arraySlice on native lowering paths', function () {
    const androidSource = readFileSync(ANDROID_NODE_BUILDER_PATH, 'utf8');
    const iosSource = readFileSync(IOS_NODE_BUILDER_PATH, 'utf8');

    expect(androidSource).toContain('currentExpression.arrayFirst()');
    expect(androidSource).toContain('currentExpression.arrayFirstN');
    expect(iosSource).toContain('"array_first"');
    expect(iosSource).toContain('"array_first_n"');
    expect(iosSource).toContain('"array_slice"');
    expect(iosSource).toContain('pushArraySliceExpressionFrame');
  });

  it('preserves boolean constants and boolean logical/aggregate lowering on iOS', function () {
    const androidSource = readFileSync(ANDROID_NODE_BUILDER_PATH, 'utf8');
    const iosSource = readFileSync(IOS_NODE_BUILDER_PATH, 'utf8');

    expect(iosSource).toContain('CFBooleanGetTypeID');
    expect(iosSource).toContain('"xor"');
    expect(iosSource).toContain('"nor"');
    expect(iosSource).toContain('normalizedKind == "count_if"');
    expect(iosSource).toContain('coerceBooleanExpression');

    expect(androidSource).toContain('count_if');
    expect(androidSource).toContain('coerceBooleanValueNode');
  });

  it('coerceDocumentPathValue uses resolved string after constant unwrapping on native builders', function () {
    const androidSource = readFileSync(ANDROID_NODE_BUILDER_PATH, 'utf8');
    const iosSource = readFileSync(IOS_NODE_BUILDER_PATH, 'utf8');

    const androidFn = extractJavaMethod(
      androidSource,
      'private String coerceDocumentPathValue(Object value, String fieldName)',
      'private Object resolveConstantValue(Object value, String fieldName)',
    );
    const iosFn = extractSwiftFunction(
      iosSource,
      'private func coerceDocumentPathValue(_ value: Any, fieldName: String) throws -> String {',
      'private func buildParentExprBridge(referenceArg: ExprBridge) -> ExprBridge {',
    );

    expect(androidFn).toContain('unwrapConstantValue(map, fieldName)');
    expect(androidFn).toContain('isSerializedReferencePathConstantMap(map)');
    expect(androidFn).toContain('instanceof DocumentReference');
    expect(androidFn).toContain('return coerceStringValue(resolved, fieldName);');
    expect(androidFn).not.toContain('return coerceStringValue(value, fieldName);');

    expect(iosFn).toContain('resolved as? DocumentReference');
    expect(iosFn).toContain('isSerializedReferencePathConstantMap(map)');
    expect(iosFn).toContain('return try coerceStringValue(resolved, fieldName: fieldName)');
    expect(iosFn).not.toContain('return try coerceStringValue(value, fieldName: fieldName)');
  });
});
