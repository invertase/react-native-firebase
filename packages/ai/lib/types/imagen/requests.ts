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

import { ImagenImageFormat } from '../../requests/imagen-image-format';

/**
 * Parameters for configuring an {@link ImagenModel}.
 *
 * @beta
 */
export interface ImagenModelParams {
  /**
   * The Imagen model to use for generating images.
   * For example: `imagen-3.0-generate-002`.
   *
   * Only Imagen 3 models (named `imagen-3.0-*`) are supported.
   *
   * See {@link https://firebase.google.com/docs/vertex-ai/models | model versions}
   * for a full list of supported Imagen 3 models.
   */
  model: string;
  /**
   * Configuration options for generating images with Imagen.
   */
  generationConfig?: ImagenGenerationConfig;
  /**
   * Safety settings for filtering potentially inappropriate content.
   */
  safetySettings?: ImagenSafetySettings;
}

/**
 * Configuration options for generating images with Imagen.
 *
 * See the {@link http://firebase.google.com/docs/vertex-ai/generate-images-imagen | documentation} for
 * more details.
 *
 * @beta
 */
export interface ImagenGenerationConfig {
  /**
   * A description of what should be omitted from the generated images.
   *
   * Support for negative prompts depends on the Imagen model.
   *
   * See the {@link http://firebase.google.com/docs/vertex-ai/model-parameters#imagen | documentation} for more details.
   *
   * This is no longer supported in the Gemini Developer API ({@link GoogleAIBackend}) in versions
   * greater than `imagen-3.0-generate-002`.
   */
  negativePrompt?: string;
  /**
   * The number of images to generate. The default value is 1.
   *
   * The number of sample images that may be generated in each request depends on the model
   * (typically up to 4); see the <a href="http://firebase.google.com/docs/vertex-ai/model-parameters#imagen">sampleCount</a>
   * documentation for more details.
   */
  numberOfImages?: number;
  /**
   * The aspect ratio of the generated images. The default value is square 1:1.
   * Supported aspect ratios depend on the Imagen model, see {@link (ImagenAspectRatio:type)}
   * for more details.
   */
  aspectRatio?: ImagenAspectRatio;
  /**
   * The image format of the generated images. The default is PNG.
   *
   * See {@link ImagenImageFormat} for more details.
   */
  imageFormat?: ImagenImageFormat;
  /**
   * Whether to add an invisible watermark to generated images.
   *
   * If set to `true`, an invisible SynthID watermark is embedded in generated images to indicate
   * that they are AI generated. If set to `false`, watermarking will be disabled.
   *
   * For Imagen 3 models, the default value is `true`; see the <a href="http://firebase.google.com/docs/vertex-ai/model-parameters#imagen">addWatermark</a>
   * documentation for more details.
   *
   * When using the Gemini Developer API ({@link GoogleAIBackend}), this will default to true,
   * and cannot be turned off.
   */
  addWatermark?: boolean;
}

/**
 * A filter level controlling how aggressively to filter sensitive content.
 *
 * Text prompts provided as inputs and images (generated or uploaded) through Imagen on Vertex AI
 * are assessed against a list of safety filters, which include 'harmful categories' (for example,
 * `violence`, `sexual`, `derogatory`, and `toxic`). This filter level controls how aggressively to
 * filter out potentially harmful content from responses. See the {@link http://firebase.google.com/docs/vertex-ai/generate-images | documentation }
 * and the {@link https://cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen#safety-filters | Responsible AI and usage guidelines}
 * for more details.
 *
 * @beta
 */
export const ImagenSafetyFilterLevel = {
  /**
   * The most aggressive filtering level; most strict blocking.
   */
  BLOCK_LOW_AND_ABOVE: 'block_low_and_above',
  /**
   * Blocks some sensitive prompts and responses.
   */
  BLOCK_MEDIUM_AND_ABOVE: 'block_medium_and_above',
  /**
   * Blocks few sensitive prompts and responses.
   */
  BLOCK_ONLY_HIGH: 'block_only_high',
  /**
   * The least aggressive filtering level; blocks very few sensitive prompts and responses.
   *
   * Access to this feature is restricted and may require your case to be reviewed and approved by
   * Cloud support.
   */
  BLOCK_NONE: 'block_none',
} as const;

/**
 * A filter level controlling how aggressively to filter sensitive content.
 *
 * Text prompts provided as inputs and images (generated or uploaded) through Imagen on Vertex AI
 * are assessed against a list of safety filters, which include 'harmful categories' (for example,
 * `violence`, `sexual`, `derogatory`, and `toxic`). This filter level controls how aggressively to
 * filter out potentially harmful content from responses. See the {@link http://firebase.google.com/docs/vertex-ai/generate-images | documentation }
 * and the {@link https://cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen#safety-filters | Responsible AI and usage guidelines}
 * for more details.
 *
 * @beta
 */
export type ImagenSafetyFilterLevel =
  (typeof ImagenSafetyFilterLevel)[keyof typeof ImagenSafetyFilterLevel];

/**
 * A filter level controlling whether generation of images containing people or faces is allowed.
 *
 * See the <a href="http://firebase.google.com/docs/vertex-ai/generate-images">personGeneration</a>
 * documentation for more details.
 *
 * @beta
 */
export const ImagenPersonFilterLevel = {
  /**
   * Disallow generation of images containing people or faces; images of people are filtered out.
   */
  BLOCK_ALL: 'dont_allow',
  /**
   * Allow generation of images containing adults only; images of children are filtered out.
   *
   * Generation of images containing people or faces may require your use case to be
   * reviewed and approved by Cloud support; see the {@link https://cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen#person-face-gen | Responsible AI and usage guidelines}
   * for more details.
   */
  ALLOW_ADULT: 'allow_adult',
  /**
   * Allow generation of images containing adults only; images of children are filtered out.
   *
   * Generation of images containing people or faces may require your use case to be
   * reviewed and approved by Cloud support; see the {@link https://cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen#person-face-gen | Responsible AI and usage guidelines}
   * for more details.
   */
  ALLOW_ALL: 'allow_all',
} as const;

/**
 * A filter level controlling whether generation of images containing people or faces is allowed.
 *
 * See the <a href="http://firebase.google.com/docs/vertex-ai/generate-images">personGeneration</a>
 * documentation for more details.
 *
 * @beta
 */
export type ImagenPersonFilterLevel =
  (typeof ImagenPersonFilterLevel)[keyof typeof ImagenPersonFilterLevel];

/**
 * Settings for controlling the aggressiveness of filtering out sensitive content.
 *
 * See the {@link http://firebase.google.com/docs/vertex-ai/generate-images | documentation }
 * for more details.
 *
 * @beta
 */
export interface ImagenSafetySettings {
  /**
   * A filter level controlling how aggressive to filter out sensitive content from generated
   * images.
   */
  safetyFilterLevel?: ImagenSafetyFilterLevel;
  /**
   * A filter level controlling whether generation of images containing people or faces is allowed.
   */
  personFilterLevel?: ImagenPersonFilterLevel;
}

/**
 * Aspect ratios for Imagen images.
 *
 * To specify an aspect ratio for generated images, set the `aspectRatio` property in your
 * {@link ImagenGenerationConfig}.
 *
 * See the {@link http://firebase.google.com/docs/vertex-ai/generate-images | documentation }
 * for more details and examples of the supported aspect ratios.
 *
 * @beta
 */
export const ImagenAspectRatio = {
  /**
   * Square (1:1) aspect ratio.
   */
  SQUARE: '1:1',
  /**
   * Landscape (3:4) aspect ratio.
   */
  LANDSCAPE_3x4: '3:4',
  /**
   * Portrait (4:3) aspect ratio.
   */
  PORTRAIT_4x3: '4:3',
  /**
   * Landscape (16:9) aspect ratio.
   */
  LANDSCAPE_16x9: '16:9',
  /**
   * Portrait (9:16) aspect ratio.
   */
  PORTRAIT_9x16: '9:16',
} as const;

/**
 * Aspect ratios for Imagen images.
 *
 * To specify an aspect ratio for generated images, set the `aspectRatio` property in your
 * {@link ImagenGenerationConfig}.
 *
 * See the {@link http://firebase.google.com/docs/vertex-ai/generate-images | documentation }
 * for more details and examples of the supported aspect ratios.
 *
 * @beta
 */
export type ImagenAspectRatio = (typeof ImagenAspectRatio)[keyof typeof ImagenAspectRatio];
