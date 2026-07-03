/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import * as firebaseFirestorePipelines from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
import type { Firestore } from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestore';
import type { FirestorePipelineSerializedInternal } from '../../types/internal';
import type {
  AggregateFunction,
  AliasedAggregate,
  AliasedExpression,
  Expression,
  Ordering,
  Pipeline as WebSdkPipeline,
  PipelineSource as WebSdkPipelineSource,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';

export type WebPipelineInstance = WebSdkPipeline & Record<string, unknown>;
export type WebPipelineSource = WebSdkPipelineSource<WebPipelineInstance> & Record<string, unknown>;

type PipelineHelperFn = (...args: unknown[]) => unknown;
type AliasedValue = { as: (name: string) => unknown };

type NestedWebPipelineBuilder = (
  firestore: Firestore,
  pipeline: FirestorePipelineSerializedInternal,
) => WebPipelineInstance;

let nestedWebPipelineBuilder: NestedWebPipelineBuilder | null = null;
let nestedWebPipelineFirestore: Firestore | null = null;

export function configureWebNestedPipelineRevival(
  firestore: Firestore,
  builder: NestedWebPipelineBuilder,
): void {
  nestedWebPipelineFirestore = firestore;
  nestedWebPipelineBuilder = builder;
}

function extractNestedPipelineFromArg(arg: unknown): FirestorePipelineSerializedInternal | null {
  if (!isRecord(arg)) {
    return null;
  }

  if (arg.exprType === 'PipelineValue' && isRecord(arg.pipeline)) {
    return arg.pipeline as unknown as FirestorePipelineSerializedInternal;
  }

  if (isRecord(arg.source) && Array.isArray(arg.stages)) {
    return arg as unknown as FirestorePipelineSerializedInternal;
  }

  return null;
}

const WEB_PIPELINE_HELPER_ALIASES: Record<string, string> = {
  lower: 'toLower',
  upper: 'toUpper',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getPipelineHelper(name: string): PipelineHelperFn {
  const helperModule = firebaseFirestorePipelines as Record<string, unknown>;
  const helper = helperModule[name] ?? helperModule[WEB_PIPELINE_HELPER_ALIASES[name] ?? ''];
  if (typeof helper !== 'function') {
    throw new Error(
      `pipelineExecute() cannot rebuild "${name}" because the web helper is missing.`,
    );
  }
  return helper as PipelineHelperFn;
}

function isExpressionNode(value: Record<string, unknown>): boolean {
  return (
    value.__kind === 'expression' ||
    value.exprType === 'Field' ||
    value.exprType === 'Constant' ||
    value.exprType === 'Variable' ||
    value.exprType === 'Function' ||
    value.exprType === 'PipelineValue'
  );
}

function isFlatAliasedFieldNode(value: Record<string, unknown>): boolean {
  const alias = value.alias ?? value.as;
  return (
    typeof value.path === 'string' &&
    value.path.length > 0 &&
    typeof alias === 'string' &&
    alias.length > 0
  );
}

function isAliasedExpressionNode(value: Record<string, unknown>): boolean {
  const alias = value.alias ?? value.as;
  return (
    typeof alias === 'string' &&
    alias.length > 0 &&
    Object.prototype.hasOwnProperty.call(value, 'expr')
  );
}

function isAliasedAggregateNode(value: Record<string, unknown>): boolean {
  return (
    typeof value.alias === 'string' &&
    value.alias.length > 0 &&
    Object.prototype.hasOwnProperty.call(value, 'aggregate')
  );
}

type ReviveMode = 'pipeline' | 'helper' | 'numericOperand' | 'comparisonOperand';

const ORDERING_COMPARISON_FUNCTIONS = new Set([
  'greaterThan',
  'greaterThanOrEqual',
  'lessThan',
  'lessThanOrEqual',
]);

const BOOLEAN_COMPARISON_FUNCTIONS = new Set([
  'equal',
  'notEqual',
  'greaterThan',
  'greaterThanOrEqual',
  'lessThan',
  'lessThanOrEqual',
  'arrayContains',
  'arrayContainsAny',
  'arrayContainsAll',
  'equalAny',
  'notEqualAny',
]);

const ARITHMETIC_FUNCTIONS = new Set(['add', 'subtract', 'multiply', 'divide', 'mod', 'pow']);

function getArgReviveMode(helperName: string, argIndex: number): ReviveMode {
  if (ARITHMETIC_FUNCTIONS.has(helperName) && argIndex > 0) {
    return 'numericOperand';
  }

  if (BOOLEAN_COMPARISON_FUNCTIONS.has(helperName) && argIndex === 1) {
    return ORDERING_COMPARISON_FUNCTIONS.has(helperName) ? 'numericOperand' : 'comparisonOperand';
  }

  return 'helper';
}

function coerceNumericOperandScalar(value: unknown): unknown {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0 && Number.isFinite(Number(trimmed))) {
      return Number(trimmed);
    }
  }

  return value;
}

function isZeroNumericOperand(value: unknown): boolean {
  if (value === 0 || value === false) {
    return true;
  }

  if (typeof value === 'string' && value.trim() === '0') {
    return true;
  }

  return false;
}

function finalizeArithmeticArgs(helperName: string, revivedArgs: unknown[]): unknown[] {
  if (!ARITHMETIC_FUNCTIONS.has(helperName)) {
    return revivedArgs;
  }

  const output = revivedArgs.slice();
  for (let index = 1; index < output.length; index++) {
    output[index] = coerceNumericOperandScalar(output[index]);
  }

  return output;
}

type ReviveWorkFrame =
  | {
      kind: 'evaluate';
      mode: ReviveMode;
      value: unknown;
      resolve: (result: unknown) => void;
    }
  | {
      kind: 'finalize';
      run: () => void;
    };

function rebuildFlatAliasedField(value: Record<string, unknown>): unknown {
  const alias = (value.alias ?? value.as) as string;
  const field = getPipelineHelper('field')(value.path) as Expression & Partial<AliasedValue>;
  const asFn = field.as;
  if (typeof asFn !== 'function') {
    throw new Error('pipelineExecute() failed to rebuild flat aliased field for web SDK.');
  }
  return asFn.call(field, alias);
}

function applyAlias(
  revivedValue: unknown,
  alias: string,
  nodeKey: 'expr' | 'aggregate',
): AliasedExpression | AliasedAggregate {
  if (
    !revivedValue ||
    (typeof revivedValue !== 'object' && typeof revivedValue !== 'function') ||
    !('as' in revivedValue)
  ) {
    throw new Error(`pipelineExecute() failed to rebuild aliased ${nodeKey}: invalid value.`);
  }

  return (revivedValue as AliasedValue).as(alias) as AliasedExpression | AliasedAggregate;
}

function rebuildExpressionNode(
  stack: ReviveWorkFrame[],
  node: Record<string, unknown>,
  mode: ReviveMode,
  resolve: (result: unknown) => void,
): void {
  if (node.exprType === 'Field' || typeof node.path === 'string') {
    resolve(getPipelineHelper('field')(node.path) as Expression);
    return;
  }

  if (node.exprType === 'Constant' || Object.prototype.hasOwnProperty.call(node, 'value')) {
    if (mode === 'numericOperand') {
      if (typeof node.value === 'boolean') {
        resolve(coerceNumericOperandScalar(node.value));
        return;
      }

      stack.push({
        kind: 'evaluate',
        mode: 'helper',
        value: node.value,
        resolve: result => {
          resolve(coerceNumericOperandScalar(result));
        },
      });
      return;
    }

    if (mode === 'comparisonOperand') {
      let revivedValue: unknown;
      stack.push({
        kind: 'finalize',
        run: () => {
          resolve(getPipelineHelper('constant')(revivedValue) as Expression);
        },
      });
      stack.push({
        kind: 'evaluate',
        mode: 'helper',
        value: node.value,
        resolve: result => {
          revivedValue = result;
        },
      });
      return;
    }

    if (mode === 'helper') {
      stack.push({
        kind: 'evaluate',
        mode,
        value: node.value,
        resolve,
      });
      return;
    }

    let revivedValue: unknown;
    stack.push({
      kind: 'finalize',
      run: () => {
        resolve(getPipelineHelper('constant')(revivedValue) as Expression);
      },
    });
    stack.push({
      kind: 'evaluate',
      mode,
      value: node.value,
      resolve: result => {
        revivedValue = result;
      },
    });
    return;
  }

  if (node.exprType === 'Variable' && typeof node.name === 'string') {
    resolve(getPipelineHelper('variable')(node.name) as Expression);
    return;
  }

  if (typeof node.name === 'string') {
    const helperName = node.name;
    const args = Array.isArray(node.args) ? node.args : [];

    if (
      (helperName === 'scalar' || helperName === 'array') &&
      args.length === 1 &&
      nestedWebPipelineBuilder &&
      nestedWebPipelineFirestore
    ) {
      const nestedPipeline = extractNestedPipelineFromArg(args[0]);
      if (nestedPipeline) {
        const pipelineInstance = nestedWebPipelineBuilder(
          nestedWebPipelineFirestore,
          nestedPipeline,
        );
        const subqueryMethod =
          helperName === 'scalar'
            ? pipelineInstance.toScalarExpression
            : pipelineInstance.toArrayExpression;
        if (typeof subqueryMethod !== 'function') {
          throw new Error(
            'pipelineExecute() expected nested pipeline to support subquery expression conversion for web SDK.',
          );
        }
        resolve(subqueryMethod.call(pipelineInstance) as Expression);
        return;
      }
    }

    const revivedArgs = new Array(args.length);

    stack.push({
      kind: 'finalize',
      run: () => {
        if (helperName === 'array') {
          resolve(getPipelineHelper(helperName)(revivedArgs) as Expression);
          return;
        }
        const finalizedArgs = finalizeArithmeticArgs(helperName, revivedArgs);
        if (helperName === 'divide' && isZeroNumericOperand(finalizedArgs[1])) {
          resolve(getPipelineHelper('constant')(0) as Expression);
          return;
        }
        resolve(getPipelineHelper(helperName)(...finalizedArgs) as Expression);
      },
    });

    for (let i = args.length - 1; i >= 0; i--) {
      const argMode = helperName === 'conditional' ? 'pipeline' : getArgReviveMode(helperName, i);
      stack.push({
        kind: 'evaluate',
        mode: argMode,
        value: args[i],
        resolve: result => {
          revivedArgs[i] = result;
        },
      });
    }
    return;
  }

  throw new Error('pipelineExecute() failed to rebuild a serialized expression node for web SDK.');
}

function rebuildAggregateNode(
  stack: ReviveWorkFrame[],
  node: Record<string, unknown>,
  resolve: (result: unknown) => void,
): void {
  if (typeof node.kind !== 'string') {
    throw new Error('pipelineExecute() failed to rebuild aggregate node: missing aggregate kind.');
  }

  const helperName = node.kind;
  const args = Array.isArray(node.args) ? node.args : [];
  const revivedArgs = new Array(args.length);

  stack.push({
    kind: 'finalize',
    run: () => {
      resolve(getPipelineHelper(helperName)(...revivedArgs) as AggregateFunction);
    },
  });

  for (let i = args.length - 1; i >= 0; i--) {
    stack.push({
      kind: 'evaluate',
      mode: 'helper',
      value: args[i],
      resolve: result => {
        revivedArgs[i] = result;
      },
    });
  }
}

function rebuildOrderingNode(
  stack: ReviveWorkFrame[],
  node: Record<string, unknown>,
  resolve: (result: unknown) => void,
): void {
  if (!Object.prototype.hasOwnProperty.call(node, 'expr')) {
    throw new Error('pipelineExecute() failed to rebuild ordering node: missing expr.');
  }

  const direction = node.direction === 'descending' ? 'descending' : 'ascending';
  let revivedExpr: unknown;

  stack.push({
    kind: 'finalize',
    run: () => {
      resolve(getPipelineHelper(direction)(revivedExpr) as Ordering);
    },
  });
  stack.push({
    kind: 'evaluate',
    mode: 'pipeline',
    value: node.expr,
    resolve: result => {
      revivedExpr = result;
    },
  });
}

function rebuildAliasedNode(
  stack: ReviveWorkFrame[],
  node: Record<string, unknown>,
  nodeKey: 'expr' | 'aggregate',
  resolve: (result: unknown) => void,
): void {
  const alias = typeof node.alias === 'string' ? node.alias : undefined;
  if (!alias) {
    throw new Error(`pipelineExecute() failed to rebuild aliased node: missing ${nodeKey} alias.`);
  }

  let revivedValue: unknown;
  stack.push({
    kind: 'finalize',
    run: () => {
      resolve(applyAlias(revivedValue, alias, nodeKey));
    },
  });
  stack.push({
    kind: 'evaluate',
    mode: 'pipeline',
    value: node[nodeKey],
    resolve: result => {
      revivedValue = result;
    },
  });
}

function reviveValueWithMode(value: unknown, mode: ReviveMode): unknown {
  let finalValue: unknown;
  const stack: ReviveWorkFrame[] = [
    {
      kind: 'evaluate',
      mode,
      value,
      resolve: result => {
        finalValue = result;
      },
    },
  ];

  while (stack.length > 0) {
    const frame = stack.pop()!;

    if (frame.kind === 'finalize') {
      frame.run();
      continue;
    }

    const currentValue = frame.value;
    if (Array.isArray(currentValue)) {
      const revived = new Array(currentValue.length);
      frame.resolve(revived);
      for (let i = currentValue.length - 1; i >= 0; i--) {
        stack.push({
          kind: 'evaluate',
          mode: frame.mode,
          value: currentValue[i],
          resolve: result => {
            revived[i] = result;
          },
        });
      }
      continue;
    }

    if (!isRecord(currentValue)) {
      if (frame.mode === 'numericOperand') {
        frame.resolve(coerceNumericOperandScalar(currentValue));
        continue;
      }

      frame.resolve(currentValue);
      continue;
    }

    if (frame.mode === 'numericOperand' || frame.mode === 'comparisonOperand') {
      if (isExpressionNode(currentValue)) {
        rebuildExpressionNode(stack, currentValue, frame.mode, frame.resolve);
        continue;
      }
    }

    if (frame.mode === 'helper') {
      if (
        isFlatAliasedFieldNode(currentValue) ||
        isAliasedExpressionNode(currentValue) ||
        isAliasedAggregateNode(currentValue) ||
        currentValue.__kind === 'aggregate' ||
        currentValue.__kind === 'ordering'
      ) {
        stack.push({
          kind: 'evaluate',
          mode: 'pipeline',
          value: currentValue,
          resolve: frame.resolve,
        });
        continue;
      }

      if (isExpressionNode(currentValue)) {
        rebuildExpressionNode(stack, currentValue, frame.mode, frame.resolve);
        continue;
      }
    } else {
      if (isFlatAliasedFieldNode(currentValue)) {
        frame.resolve(rebuildFlatAliasedField(currentValue));
        continue;
      }

      if (isAliasedExpressionNode(currentValue)) {
        rebuildAliasedNode(stack, currentValue, 'expr', frame.resolve);
        continue;
      }

      if (isAliasedAggregateNode(currentValue)) {
        rebuildAliasedNode(stack, currentValue, 'aggregate', frame.resolve);
        continue;
      }

      switch (currentValue.__kind) {
        case 'expression':
          rebuildExpressionNode(stack, currentValue, frame.mode, frame.resolve);
          continue;
        case 'aggregate':
          rebuildAggregateNode(stack, currentValue, frame.resolve);
          continue;
        case 'ordering':
          rebuildOrderingNode(stack, currentValue, frame.resolve);
          continue;
        case 'aliasedExpression':
          rebuildAliasedNode(stack, currentValue, 'expr', frame.resolve);
          continue;
        case 'aliasedAggregate':
          rebuildAliasedNode(stack, currentValue, 'aggregate', frame.resolve);
          continue;
        default:
      }
    }

    const revived: Record<string, unknown> = {};
    frame.resolve(revived);
    const entries = Object.entries(currentValue);
    for (let i = entries.length - 1; i >= 0; i--) {
      const [key, entry] = entries[i]!;
      stack.push({
        kind: 'evaluate',
        mode: frame.mode,
        value: entry,
        resolve: result => {
          revived[key] = result;
        },
      });
    }
  }

  return finalValue;
}

export function revivePipelineValue(value: unknown): unknown {
  return reviveValueWithMode(value, 'pipeline');
}
