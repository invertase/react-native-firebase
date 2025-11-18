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

import { ImagenGenerationConfig, ImagenSafetySettings } from './requests';

/**
 * A response from the REST API is expected to look like this in the success case:
 * {
 *   "predictions": [
 *     {
 *       "mimeType": "image/png",
 *       "bytesBase64Encoded": "iVBORw0KG..."
 *     },
 *     {
 *       "mimeType": "image/png",
 *       "bytesBase64Encoded": "i4BOtw0KG..."
 *     }
 *   ]
 * }
 *
 * And like this in the failure case:
 * {
 *   "predictions": [
 *     {
 *       "raiFilteredReason": "..."
 *     }
 *   ]
 * }
 *
 * @internal
 */
export interface ImagenResponseInternal {
  predictions?: Array<{
    /**
     * The MIME type of the generated image.
     */
    mimeType?: string;
    /**
     * The image data encoded as a base64 string.
     */
    bytesBase64Encoded?: string;
    /**
     * The GCS URI where the image was stored.
     */
    gcsUri?: string;
    /**
     * The reason why the image was filtered.
     */
    raiFilteredReason?: string;
    /**
     * Safety attributes for the prediction.
     */
    safetyAttributes?: unknown;
  }>;
}

/**
 * The parameters to be sent in the request body of the HTTP call
 * to the Vertex AI backend.
 *
 * We need a separate internal-only interface for this because the REST
 * API expects different parameter names than what we show to our users.
 *
 * Sample request body JSON:
 * {
 *   "instances": [
 *     {
 *       "prompt": "Portrait of a golden retriever on a beach."
 *     }
 *   ],
 *   "parameters": {
 *     "mimeType": "image/png",
 *     "safetyFilterLevel": "block_low_and_above",
 *     "personGeneration": "allow_all",
 *     "sampleCount": 2,
 *     "includeRaiReason": true,
 *     "aspectRatio": "9:16"
 *   }
 * }
 *
 * See the Google Cloud docs: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api#-drest
 *
 * @internal
 */
export interface PredictRequestBody {
  instances: [
    {
      prompt: string;
    },
  ];
  parameters: {
    sampleCount: number; // Maps to numberOfImages
    aspectRatio?: string;
    outputOptions?: {
      mimeType: string;
      compressionQuality?: number;
    };
    negativePrompt?: string;
    storageUri?: string; // Maps to gcsURI
    addWatermark?: boolean;
    safetyFilterLevel?: string;
    personGeneration?: string; // Maps to personFilterLevel
    includeRaiReason: boolean;
  };
}

/**
 * Contains all possible REST API parameters that are provided by the caller.
 *
 * @internal
 */
export type ImagenGenerationParams = {
  /**
   * The Cloud Storage for Firebase bucket URI where the images should be stored
   * (for GCS requests only).
   */
  gcsURI?: string;
} & ImagenGenerationConfig &
  ImagenSafetySettings;
