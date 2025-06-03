/**
 * @license
 * Copyright 2025 Google LLC
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
  Tool,
  GenerationConfig,
  Citation,
  FinishReason,
  GroundingMetadata,
  PromptFeedback,
  SafetyRating,
  UsageMetadata,
} from '../public-types';
import { Content, Part } from './content';

/**
 * @internal
 */
export interface GoogleAICountTokensRequest {
  generateContentRequest: {
    model: string; // 'models/model-name'
    contents: Content[];
    systemInstruction?: string | Part | Content;
    tools?: Tool[];
    generationConfig?: GenerationConfig;
  };
}

/**
 * @internal
 */
export interface GoogleAIGenerateContentResponse {
  candidates?: GoogleAIGenerateContentCandidate[];
  promptFeedback?: PromptFeedback;
  usageMetadata?: UsageMetadata;
}

/**
 * @internal
 */
export interface GoogleAIGenerateContentCandidate {
  index: number;
  content: Content;
  finishReason?: FinishReason;
  finishMessage?: string;
  safetyRatings?: SafetyRating[];
  citationMetadata?: GoogleAICitationMetadata;
  groundingMetadata?: GroundingMetadata;
}

/**
 * @internal
 */
export interface GoogleAICitationMetadata {
  citationSources: Citation[]; // Maps to `citations`
}
