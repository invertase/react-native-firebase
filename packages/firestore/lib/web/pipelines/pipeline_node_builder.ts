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
    value.exprType === 'Function'
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

type ReviveMode = 'pipeline' | 'helper';

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

  if (typeof node.name === 'string') {
    const helperName = node.name;
    const args = Array.isArray(node.args) ? node.args : [];
    const revivedArgs = new Array(args.length);
    const argsMode = helperName === 'conditional' ? 'pipeline' : 'helper';

    stack.push({
      kind: 'finalize',
      run: () => {
        if (helperName === 'array') {
          resolve(getPipelineHelper(helperName)(revivedArgs) as Expression);
          return;
        }
        resolve(getPipelineHelper(helperName)(...revivedArgs) as Expression);
      },
    });

    for (let i = args.length - 1; i >= 0; i--) {
      stack.push({
        kind: 'evaluate',
        mode: argsMode,
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
      frame.resolve(currentValue);
      continue;
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
