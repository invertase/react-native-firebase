import { ApiSettings } from '../types/internal';
import { AIError } from '../errors';
import { AIErrorCode } from '../types';
import { AI, BackendType } from '../public-types';
import { AIService } from '../service';

/**
 * Base class for Firebase AI model APIs.
 *
 * Instances of this class are associated with a specific Firebase AI {@link Backend}
 * and provide methods for interacting with the configured generative model.
 *
 * @public
 */
export abstract class AIModel {
  /**
   * The fully qualified model resource name to use for generating images
   * (for example, `publishers/google/models/imagen-3.0-generate-002`).
   */
  readonly model: string;

  /**
   * @internal
   */
  protected _apiSettings: ApiSettings;

  /**
   * Constructs a new instance of the {@link AIModel} class.
   *
   * This constructor should only be called from subclasses that provide
   * a model API.
   *
   * @param ai - an {@link AI} instance.
   * @param modelName - The name of the model being used. It can be in one of the following formats:
   * - `my-model` (short name, will resolve to `publishers/google/models/my-model`)
   * - `models/my-model` (will resolve to `publishers/google/models/my-model`)
   * - `publishers/my-publisher/models/my-model` (fully qualified model name)
   *
   * @throws If the `apiKey` or `projectId` fields are missing in your
   * Firebase config.
   *
   * @internal
   */
  protected constructor(ai: AI, modelName: string) {
    if (!ai.app?.options?.apiKey) {
      throw new AIError(
        AIErrorCode.NO_API_KEY,
        `The "apiKey" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid API key.`,
      );
    } else if (!ai.app?.options?.projectId) {
      throw new AIError(
        AIErrorCode.NO_PROJECT_ID,
        `The "projectId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid project ID.`,
      );
    } else if (!ai.app?.options?.appId) {
      throw new AIError(
        AIErrorCode.NO_APP_ID,
        `The "appId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid app ID.`,
      );
    } else {
      this._apiSettings = {
        apiKey: ai.app.options.apiKey,
        project: ai.app.options.projectId,
        appId: ai.app.options.appId,
        automaticDataCollectionEnabled: ai.app.automaticDataCollectionEnabled,
        location: ai.location,
        backend: ai.backend,
      };
      if ((ai as AIService).appCheck) {
        this._apiSettings.getAppCheckToken = () => (ai as AIService).appCheck!.getToken();
      }

      if ((ai as AIService).auth?.currentUser) {
        this._apiSettings.getAuthToken = () => (ai as AIService).auth!.currentUser!.getIdToken();
      }

      this.model = AIModel.normalizeModelName(modelName, this._apiSettings.backend.backendType);
    }
  }

  /**
   * Normalizes the given model name to a fully qualified model resource name.
   *
   * @param modelName - The model name to normalize.
   * @returns The fully qualified model resource name.
   *
   * @internal
   */
  static normalizeModelName(modelName: string, backendType: BackendType): string {
    if (backendType === BackendType.GOOGLE_AI) {
      return AIModel.normalizeGoogleAIModelName(modelName);
    } else {
      return AIModel.normalizeVertexAIModelName(modelName);
    }
  }

  /**
   * @internal
   */
  private static normalizeGoogleAIModelName(modelName: string): string {
    return `models/${modelName}`;
  }

  /**
   * @internal
   */
  private static normalizeVertexAIModelName(modelName: string): string {
    let model: string;
    if (modelName.includes('/')) {
      if (modelName.startsWith('models/')) {
        // Add 'publishers/google' if the user is only passing in 'models/model-name'.
        model = `publishers/google/${modelName}`;
      } else {
        // Any other custom format (e.g. tuned models) must be passed in correctly.
        model = modelName;
      }
    } else {
      // If path is not included, assume it's a non-tuned model.
      model = `publishers/google/models/${modelName}`;
    }

    return model;
  }
}
