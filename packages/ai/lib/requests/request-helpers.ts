/**
 * @license
 * Copyright 2024 Google LLC
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
 */

import {
  Content,
  FunctionResponse,
  GenerateContentRequest,
  Part,
  UnknownPart,
  AIErrorCode,
} from '../types';
import { AIError } from '../errors';

/**
 * Ensures a `Part` or `UnknownPart` object has its `type` discriminator populated.
 *
 * @internal
 */
export function assignPartType(part: Part | UnknownPart): Part {
  if ('type' in part && part.type) {
    return part as Part;
  } else if (part.text !== undefined) {
    return { ...part, type: 'text' } as Part;
  } else if (part.inlineData !== undefined) {
    return { ...part, type: 'inlineData' } as Part;
  } else if (part.functionCall !== undefined) {
    return { ...part, type: 'functionCall' } as Part;
  } else if (part.functionResponse !== undefined) {
    return { ...part, type: 'functionResponse' } as Part;
  } else if (part.fileData !== undefined) {
    return { ...part, type: 'fileData' } as Part;
  } else if (part.executableCode !== undefined) {
    return { ...part, type: 'executableCode' } as Part;
  } else if (part.codeExecutionResult !== undefined) {
    return { ...part, type: 'codeExecutionResult' } as Part;
  }
  return part as Part;
}

function cleanFunctionResponseForWire(fnResponse: FunctionResponse): FunctionResponse {
  if (fnResponse.parts && Array.isArray(fnResponse.parts)) {
    return {
      ...fnResponse,
      parts: fnResponse.parts.map(stripPartType) as Part[],
    };
  }
  return fnResponse;
}

/**
 * Strips client-side `type` discriminator from a Part, returning an untagged wire part.
 * Creates a new part object so in-memory instances (e.g. in chat history) are not mutated.
 *
 * @internal
 */
export function stripPartType(part: Part | UnknownPart): UnknownPart {
  let wirePart: UnknownPart;
  if ('type' in part) {
    const { type: _type, ...rest } = part as Part & { type: string };
    wirePart = rest;
  } else {
    wirePart = { ...part };
  }
  if (wirePart.functionResponse) {
    wirePart = {
      ...wirePart,
      functionResponse: cleanFunctionResponseForWire(wirePart.functionResponse),
    };
  }
  return wirePart;
}

/**
 * Cleans a `Content` object for wire transmission by stripping `type` from all its parts.
 *
 * @internal
 */
export function cleanContentForWire(content: Content): Content {
  if (!content.parts) {
    return content;
  }
  return {
    ...content,
    // Wire parts are untagged; cast keeps GenerateContentRequest.contents typed as Content[].
    parts: content.parts.map(stripPartType) as Part[],
  };
}

/**
 * Cleans a systemInstruction parameter for wire transmission by stripping `type` from its parts if present.
 *
 * @internal
 */
export function cleanSystemInstructionForWire(
  systemInstruction?: string | Part | Content,
): string | Part | Content | undefined {
  if (systemInstruction == null || typeof systemInstruction === 'string') {
    return systemInstruction;
  }
  if ('parts' in systemInstruction && Array.isArray(systemInstruction.parts)) {
    return cleanContentForWire(systemInstruction);
  }
  return stripPartType(systemInstruction as Part) as Part;
}

/**
 * Prepares a {@link GenerateContentRequest} for the wire by stripping Part `type` discriminators.
 *
 * @internal
 */
export function cleanGenerateContentRequestForWire(
  params: GenerateContentRequest,
): GenerateContentRequest {
  return {
    ...params,
    contents: params.contents.map(cleanContentForWire),
    systemInstruction: cleanSystemInstructionForWire(params.systemInstruction),
  };
}

export function formatSystemInstruction(input?: string | Part | Content): Content | undefined {
  if (input == null) {
    return undefined;
  } else if (typeof input === 'string') {
    return { role: 'system', parts: [{ type: 'text', text: input }] };
  } else if (
    (typeof input === 'object' && input !== null && 'text' in input && input.text !== undefined) ||
    (typeof input === 'object' && input !== null && 'type' in input && input.type === 'text')
  ) {
    return { role: 'system', parts: [assignPartType(input as Part)] };
  } else if ((input as Content).parts) {
    if (!(input as Content).role) {
      return {
        role: 'system',
        parts: (input as Content).parts.map(assignPartType),
      };
    } else {
      return {
        ...(input as Content),
        parts: (input as Content).parts.map(assignPartType),
      };
    }
  }
  return undefined;
}

export function formatNewContent(request: string | Array<string | Part>): Content {
  let newParts: Part[] = [];
  if (typeof request === 'string') {
    newParts = [{ type: 'text', text: request }];
  } else {
    for (const partOrString of request) {
      if (typeof partOrString === 'string') {
        newParts.push({ type: 'text', text: partOrString });
      } else {
        newParts.push(assignPartType(partOrString));
      }
    }
  }
  return assignRoleToPartsAndValidateSendMessageRequest(newParts);
}

/**
 * When multiple Part types (i.e. FunctionResponsePart and TextPart) are
 * passed in a single Part array, we may need to assign different roles to each
 * part. Currently only FunctionResponsePart requires a role other than 'user'.
 * @private
 * @param parts Array of parts to pass to the model
 * @returns Array of content items
 */
function assignRoleToPartsAndValidateSendMessageRequest(parts: Part[]): Content {
  const userContent: Content = { role: 'user', parts: [] };
  const functionContent: Content = { role: 'function', parts: [] };
  let hasUserContent = false;
  let hasFunctionContent = false;
  for (const part of parts) {
    if (part.type === 'functionResponse' || 'functionResponse' in part) {
      functionContent.parts.push(part);
      hasFunctionContent = true;
    } else {
      userContent.parts.push(part);
      hasUserContent = true;
    }
  }

  if (hasUserContent && hasFunctionContent) {
    throw new AIError(
      AIErrorCode.INVALID_CONTENT,
      'Within a single message, FunctionResponse cannot be mixed with other type of Part in the request for sending chat message.',
    );
  }

  if (!hasUserContent && !hasFunctionContent) {
    throw new AIError(
      AIErrorCode.INVALID_CONTENT,
      'No Content is provided for sending chat message.',
    );
  }

  if (hasUserContent) {
    return userContent;
  }

  return functionContent;
}

export function formatGenerateContentInput(
  params: GenerateContentRequest | string | Array<string | Part>,
): GenerateContentRequest {
  let formattedRequest: GenerateContentRequest;
  if ((params as GenerateContentRequest).contents) {
    formattedRequest = params as GenerateContentRequest;
    formattedRequest = {
      ...formattedRequest,
      contents: formattedRequest.contents.map(content => ({
        ...content,
        parts: content.parts.map(assignPartType),
      })),
    };
  } else {
    // Array or string
    const content = formatNewContent(params as string | Array<string | Part>);
    formattedRequest = { contents: [content] };
  }
  if ((params as GenerateContentRequest).systemInstruction) {
    formattedRequest.systemInstruction = formatSystemInstruction(
      (params as GenerateContentRequest).systemInstruction,
    );
  }
  return formattedRequest;
}
