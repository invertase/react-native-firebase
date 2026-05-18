/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Content,
  FunctionCall,
  FunctionDeclaration,
  FunctionResponse,
  GenerateContentRequest,
  GenerateContentResult,
  SingleRequestOptions,
  Tool,
} from '../types';
import { ApiSettings } from '../types/internal';
import { generateContent } from './generate-content';

const DEFAULT_MAX_SEQUENTIAL_FUNCTION_CALLS = 10;

export interface AutomaticFunctionCallingResult {
  result: GenerateContentResult;
  addedContents: Content[];
}

export async function generateContentWithAutomaticFunctionCalling(
  apiSettings: ApiSettings,
  model: string,
  params: GenerateContentRequest,
  result: GenerateContentResult,
  requestOptions?: SingleRequestOptions,
): Promise<AutomaticFunctionCallingResult> {
  let remainingFunctionCalls =
    requestOptions?.maxSequentialFunctionCalls ?? DEFAULT_MAX_SEQUENTIAL_FUNCTION_CALLS;
  let currentParams = params;
  let currentResult = result;
  const addedContents: Content[] = [];

  while (remainingFunctionCalls > 0) {
    const functionCalls = currentResult.response.functionCalls?.();
    if (!functionCalls?.length) {
      return { result: currentResult, addedContents };
    }

    const functionResponses = await callFunctionReferences(currentParams.tools, functionCalls);
    if (!functionResponses) {
      return { result: currentResult, addedContents };
    }

    const responseContent = getModelResponseContent(currentResult);
    if (!responseContent) {
      return { result: currentResult, addedContents };
    }

    remainingFunctionCalls -= 1;
    const functionResponseContent: Content = {
      role: 'function',
      parts: functionResponses.map(functionResponse => ({ functionResponse })),
    };
    addedContents.push(responseContent, functionResponseContent);
    currentParams = {
      ...currentParams,
      contents: [...currentParams.contents, responseContent, functionResponseContent],
    };
    currentResult = await generateContent(apiSettings, model, currentParams, requestOptions);
  }

  return { result: currentResult, addedContents };
}

function getModelResponseContent(result: GenerateContentResult): Content | undefined {
  const responseContent = result.response.candidates?.[0]?.content;
  if (!responseContent) {
    return undefined;
  }
  return {
    parts: responseContent.parts || [],
    role: responseContent.role || 'model',
  };
}

async function callFunctionReferences(
  tools: Tool[] | undefined,
  functionCalls: FunctionCall[],
): Promise<FunctionResponse[] | undefined> {
  const declarations = getFunctionDeclarationsWithReferences(tools);
  if (!declarations.length) {
    return undefined;
  }

  const functionResponses: FunctionResponse[] = [];
  for (const functionCall of functionCalls) {
    const declaration = declarations.find(candidate => candidate.name === functionCall.name);
    if (!declaration?.functionReference) {
      return undefined;
    }

    const response = (await declaration.functionReference(functionCall.args)) as object;
    functionResponses.push({
      id: functionCall.id,
      name: functionCall.name,
      response,
    });
  }
  return functionResponses;
}

function getFunctionDeclarationsWithReferences(tools: Tool[] | undefined): FunctionDeclaration[] {
  return (
    tools?.flatMap(tool =>
      'functionDeclarations' in tool
        ? (tool.functionDeclarations?.filter(declaration => declaration.functionReference) ?? [])
        : [],
    ) ?? []
  );
}
