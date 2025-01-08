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

/**
 * Role is the producer of the content.
 * @public
 */
export type Role = (typeof POSSIBLE_ROLES)[number];

/**
 * Possible roles.
 * @public
 */
export const POSSIBLE_ROLES = ['user', 'model', 'function', 'system'] as const;

/**
 * Harm categories that would cause prompts or candidates to be blocked.
 * @public
 */
export enum HarmCategory {
  HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
  HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
  HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT',
}

/**
 * Threshold above which a prompt or candidate will be blocked.
 * @public
 */
export enum HarmBlockThreshold {
  // Content with NEGLIGIBLE will be allowed.
  BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
  // Content with NEGLIGIBLE and LOW will be allowed.
  BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
  // Content with NEGLIGIBLE, LOW, and MEDIUM will be allowed.
  BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
  // All content will be allowed.
  BLOCK_NONE = 'BLOCK_NONE',
}

/**
 * @public
 */
export enum HarmBlockMethod {
  // The harm block method uses both probability and severity scores.
  SEVERITY = 'SEVERITY',
  // The harm block method uses the probability score.
  PROBABILITY = 'PROBABILITY',
}

/**
 * Probability that a prompt or candidate matches a harm category.
 * @public
 */
export enum HarmProbability {
  // Content has a negligible chance of being unsafe.
  NEGLIGIBLE = 'NEGLIGIBLE',
  // Content has a low chance of being unsafe.
  LOW = 'LOW',
  // Content has a medium chance of being unsafe.
  MEDIUM = 'MEDIUM',
  // Content has a high chance of being unsafe.
  HIGH = 'HIGH',
}

/**
 * Harm severity levels.
 * @public
 */
export enum HarmSeverity {
  // Negligible level of harm severity.
  HARM_SEVERITY_NEGLIGIBLE = 'HARM_SEVERITY_NEGLIGIBLE',
  // Low level of harm severity.
  HARM_SEVERITY_LOW = 'HARM_SEVERITY_LOW',
  // Medium level of harm severity.
  HARM_SEVERITY_MEDIUM = 'HARM_SEVERITY_MEDIUM',
  // High level of harm severity.
  HARM_SEVERITY_HIGH = 'HARM_SEVERITY_HIGH',
}

/**
 * Reason that a prompt was blocked.
 * @public
 */
export enum BlockReason {
  // Content was blocked by safety settings.
  SAFETY = 'SAFETY',
  // Content was blocked, but the reason is uncategorized.
  OTHER = 'OTHER',
}

/**
 * Reason that a candidate finished.
 * @public
 */
export enum FinishReason {
  // Natural stop point of the model or provided stop sequence.
  STOP = 'STOP',
  // The maximum number of tokens as specified in the request was reached.
  MAX_TOKENS = 'MAX_TOKENS',
  // The candidate content was flagged for safety reasons.
  SAFETY = 'SAFETY',
  // The candidate content was flagged for recitation reasons.
  RECITATION = 'RECITATION',
  // Unknown reason.
  OTHER = 'OTHER',
}

/**
 * @public
 */
export enum FunctionCallingMode {
  // Default model behavior, model decides to predict either a function call
  // or a natural language response.
  AUTO = 'AUTO',
  // Model is constrained to always predicting a function call only.
  // If "allowed_function_names" is set, the predicted function call will be
  // limited to any one of "allowed_function_names", else the predicted
  // function call will be any one of the provided "function_declarations".
  ANY = 'ANY',
  // Model will not predict any function call. Model behavior is same as when
  // not passing any function declarations.
  NONE = 'NONE',
}
