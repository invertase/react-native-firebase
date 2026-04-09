/**
 * Paste the firebase-js-sdk AI public type snapshot into this file.
 *
 * Source guidance:
 * - Copy only the modular public exports for the AI package.
 * - Strip internal/private declarations.
 * - Keep this file in sync with the firebase-js-sdk release you want to compare against.
 *
 * Once populated, run `yarn compare:types` from the repo root to detect
 * undocumented AI API drift.
 */

/**
 * The Firebase AI Web SDK.
 *
 * @packageDocumentation
 */

import { AppCheckTokenResult } from '@firebase/app-check-interop-types';
import { FirebaseApp } from '@firebase/app';
import { FirebaseAuthTokenData } from '@firebase/auth-interop-types';
import { FirebaseError } from '@firebase/util';

/**
 * An instance of the Firebase AI SDK.
 *
 * Do not create this instance directly. Instead, use {@link getAI | getAI()}.
 *
 * @public
 */
export declare interface AI {
    /**
     * The {@link @firebase/app#FirebaseApp} this {@link AI} instance is associated with.
     */
    app: FirebaseApp;
    /**
     * A {@link Backend} instance that specifies the configuration for the target backend,
     * either the Gemini Developer API (using {@link GoogleAIBackend}) or the
     * Vertex AI Gemini API (using {@link VertexAIBackend}).
     */
    backend: Backend;
    /**
     * Options applied to this {@link AI} instance.
     */
    options?: AIOptions;
    /**
     * @deprecated use `AI.backend.location` instead.
     *
     * The location configured for this AI service instance, relevant for Vertex AI backends.
     */
    location: string;
}

/**
 * Error class for the Firebase AI SDK.
 *
 * @public
 */
export declare class AIError extends FirebaseError {
    readonly code: AIErrorCode;
    readonly customErrorData?: CustomErrorData | undefined;
    /**
     * Constructs a new instance of the `AIError` class.
     *
     * @param code - The error code from {@link (AIErrorCode:type)}.
     * @param message - A human-readable message describing the error.
     * @param customErrorData - Optional error data.
     */
    constructor(code: AIErrorCode, message: string, customErrorData?: CustomErrorData | undefined);
}

/**
 * Standardized error codes that {@link AIError} can have.
 *
 * @public
 */
export declare const AIErrorCode: {
    /** A generic error occurred. */
    readonly ERROR: "error";
    /** An error occurred in a request. */
    readonly REQUEST_ERROR: "request-error";
    /** An error occurred in a response. */
    readonly RESPONSE_ERROR: "response-error";
    /** An error occurred while performing a fetch. */
    readonly FETCH_ERROR: "fetch-error";
    /** An error occurred because an operation was attempted on a closed session. */
    readonly SESSION_CLOSED: "session-closed";
    /** An error associated with a Content object.  */
    readonly INVALID_CONTENT: "invalid-content";
    /** An error due to the Firebase API not being enabled in the Console. */
    readonly API_NOT_ENABLED: "api-not-enabled";
    /** An error due to invalid Schema input.  */
    readonly INVALID_SCHEMA: "invalid-schema";
    /** An error occurred due to a missing Firebase API key. */
    readonly NO_API_KEY: "no-api-key";
    /** An error occurred due to a missing Firebase app ID. */
    readonly NO_APP_ID: "no-app-id";
    /** An error occurred due to a model name not being specified during initialization. */
    readonly NO_MODEL: "no-model";
    /** An error occurred due to a missing project ID. */
    readonly NO_PROJECT_ID: "no-project-id";
    /** An error occurred while parsing. */
    readonly PARSE_FAILED: "parse-failed";
    /** An error occurred due an attempt to use an unsupported feature. */
    readonly UNSUPPORTED: "unsupported";
};

/**
 * Standardized error codes that {@link AIError} can have.
 *
 * @public
 */
export declare type AIErrorCode = (typeof AIErrorCode)[keyof typeof AIErrorCode];

/**
 * Base class for Firebase AI model APIs.
 *
 * Instances of this class are associated with a specific Firebase AI {@link Backend}
 * and provide methods for interacting with the configured generative model.
 *
 * @public
 */
export declare abstract class AIModel {
    /**
     * The fully qualified model resource name to use for generating images
     * (for example, `publishers/google/models/imagen-3.0-generate-002`).
     */
    readonly model: string;
    /* Excluded from this release type: _apiSettings */
    /* Excluded from this release type: __constructor */
    /* Excluded from this release type: normalizeModelName */
    /* Excluded from this release type: normalizeGoogleAIModelName */
    /* Excluded from this release type: normalizeVertexAIModelName */
}

/**
 * Options for initializing the AI service using {@link getAI | getAI()}.
 * This allows specifying which backend to use (Vertex AI Gemini API or Gemini Developer API)
 * and configuring its specific options (like location for Vertex AI).
 *
 * @public
 */
export declare interface AIOptions {
    /**
     * The backend configuration to use for the AI service instance.
     * Defaults to the Gemini Developer API backend ({@link GoogleAIBackend}).
     */
    backend?: Backend;
    /**
     * Whether to use App Check limited use tokens. Defaults to false.
     */
    useLimitedUseAppCheckTokens?: boolean;
}

/**
 * Schema class representing a value that can conform to any of the provided sub-schemas. This is
 * useful when a field can accept multiple distinct types or structures.
 * @public
 */
export declare class AnyOfSchema extends Schema {
    anyOf: TypedSchema[];
    constructor(schemaParams: SchemaParams & {
        anyOf: TypedSchema[];
    });
    /* Excluded from this release type: toJSON */
}

declare interface ApiSettings {
    apiKey: string;
    project: string;
    appId: string;
    automaticDataCollectionEnabled?: boolean;
    /**
     * @deprecated Use `backend.location` instead.
     */
    location: string;
    backend: Backend;
    getAuthToken?: () => Promise<FirebaseAuthTokenData | null>;
    getAppCheckToken?: () => Promise<AppCheckTokenResult>;
    inferenceMode?: InferenceMode;
}

/**
 * Schema class for "array" types.
 * The `items` param should refer to the type of item that can be a member
 * of the array.
 * @public
 */
export declare class ArraySchema extends Schema {
    items: TypedSchema;
    constructor(schemaParams: SchemaParams, items: TypedSchema);
    /* Excluded from this release type: toJSON */
}

/**
 * A controller for managing an active audio conversation.
 *
 * @beta
 */
export declare interface AudioConversationController {
    /**
     * Stops the audio conversation, closes the microphone connection, and
     * cleans up resources. Returns a promise that resolves when cleanup is complete.
     */
    stop: () => Promise<void>;
}

/**
 * The audio transcription configuration.
 */
export declare interface AudioTranscriptionConfig {
}

/**
 * Abstract base class representing the configuration for an AI service backend.
 * This class should not be instantiated directly. Use its subclasses; {@link GoogleAIBackend} for
 * the Gemini Developer API (via {@link https://ai.google/ | Google AI}), and
 * {@link VertexAIBackend} for the Vertex AI Gemini API.
 *
 * @public
 */
export declare abstract class Backend {
    /**
     * Specifies the backend type.
     */
    readonly backendType: BackendType;
    /**
     * Protected constructor for use by subclasses.
     * @param type - The backend type.
     */
    protected constructor(type: BackendType);
    /* Excluded from this release type: _getModelPath */
    /* Excluded from this release type: _getTemplatePath */
}

/**
 * An enum-like object containing constants that represent the supported backends
 * for the Firebase AI SDK.
 * This determines which backend service (Vertex AI Gemini API or Gemini Developer API)
 * the SDK will communicate with.
 *
 * These values are assigned to the `backendType` property within the specific backend
 * configuration objects ({@link GoogleAIBackend} or {@link VertexAIBackend}) to identify
 * which service to target.
 *
 * @public
 */
export declare const BackendType: {
    /**
     * Identifies the backend service for the Vertex AI Gemini API provided through Google Cloud.
     * Use this constant when creating a {@link VertexAIBackend} configuration.
     */
    readonly VERTEX_AI: "VERTEX_AI";
    /**
     * Identifies the backend service for the Gemini Developer API ({@link https://ai.google/ | Google AI}).
     * Use this constant when creating a {@link GoogleAIBackend} configuration.
     */
    readonly GOOGLE_AI: "GOOGLE_AI";
};

/**
 * Type alias representing valid backend types.
 * It can be either `'VERTEX_AI'` or `'GOOGLE_AI'`.
 *
 * @public
 */
export declare type BackendType = (typeof BackendType)[keyof typeof BackendType];

/**
 * Base parameters for a number of methods.
 * @public
 */
export declare interface BaseParams {
    safetySettings?: SafetySetting[];
    generationConfig?: GenerationConfig;
}

/**
 * Reason that a prompt was blocked.
 * @public
 */
export declare const BlockReason: {
    /**
     * Content was blocked by safety settings.
     */
    readonly SAFETY: "SAFETY";
    /**
     * Content was blocked, but the reason is uncategorized.
     */
    readonly OTHER: "OTHER";
    /**
     * Content was blocked because it contained terms from the terminology blocklist.
     */
    readonly BLOCKLIST: "BLOCKLIST";
    /**
     * Content was blocked due to prohibited content.
     */
    readonly PROHIBITED_CONTENT: "PROHIBITED_CONTENT";
};

/**
 * Reason that a prompt was blocked.
 * @public
 */
export declare type BlockReason = (typeof BlockReason)[keyof typeof BlockReason];

/**
 * Schema class for "boolean" types.
 * @public
 */
export declare class BooleanSchema extends Schema {
    constructor(schemaParams?: SchemaParams);
}

/**
 * ChatSession class that enables sending chat messages and stores
 * history of sent and received messages so far.
 *
 * @public
 */
export declare class ChatSession {
    model: string;
    private chromeAdapter?;
    params?: StartChatParams | undefined;
    requestOptions?: RequestOptions | undefined;
    private _apiSettings;
    private _history;
    /**
     * Ensures sequential execution of chat messages to maintain history order.
     * Each call waits for the previous one to settle before proceeding.
     */
    private _sendPromise;
    constructor(apiSettings: ApiSettings, model: string, chromeAdapter?: ChromeAdapter | undefined, params?: StartChatParams | undefined, requestOptions?: RequestOptions | undefined);
    /**
     * Gets the chat history so far. Blocked prompts are not added to history.
     * Neither blocked candidates nor the prompts that generated them are added
     * to history.
     */
    getHistory(): Promise<Content[]>;
    /* Excluded from this release type: _formatRequest */
    /**
     * Sends a chat message and receives a non-streaming
     * {@link GenerateContentResult}
     */
    sendMessage(request: string | Array<string | Part>, singleRequestOptions?: SingleRequestOptions): Promise<GenerateContentResult>;
    /**
     * Sends a chat message and receives the response as a
     * {@link GenerateContentStreamResult} containing an iterable stream
     * and a response promise.
     */
    sendMessageStream(request: string | Array<string | Part>, singleRequestOptions?: SingleRequestOptions): Promise<GenerateContentStreamResult>;
    /* Excluded from this release type: _getCallableFunctionCalls */
    /* Excluded from this release type: _callFunctionsAsNeeded */
}

/**
 * Defines an inference "backend" that uses Chrome's on-device model,
 * and encapsulates logic for detecting when on-device inference is
 * possible.
 *
 * These methods should not be called directly by the user.
 *
 * @beta
 */
export declare interface ChromeAdapter {
    /* Excluded from this release type: mode */
    /**
     * Checks if the on-device model is capable of handling a given
     * request.
     * @param request - A potential request to be passed to the model.
     */
    isAvailable(request: GenerateContentRequest): Promise<boolean>;
    /**
     * Generates content using on-device inference.
     *
     * @remarks
     * This is comparable to {@link GenerativeModel.generateContent} for generating
     * content using in-cloud inference.
     * @param request - a standard Firebase AI {@link GenerateContentRequest}
     */
    generateContent(request: GenerateContentRequest): Promise<Response>;
    /**
     * Generates a content stream using on-device inference.
     *
     * @remarks
     * This is comparable to {@link GenerativeModel.generateContentStream} for generating
     * a content stream using in-cloud inference.
     * @param request - a standard Firebase AI {@link GenerateContentRequest}
     */
    generateContentStream(request: GenerateContentRequest): Promise<Response>;
    /* Excluded from this release type: countTokens */
}

/**
 * A single citation.
 * @public
 */
export declare interface Citation {
    startIndex?: number;
    endIndex?: number;
    uri?: string;
    license?: string;
    /**
     * The title of the cited source, if available.
     *
     * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
     */
    title?: string;
    /**
     * The publication date of the cited source, if available.
     *
     * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
     */
    publicationDate?: Date_2;
}

/**
 * Citation metadata that may be found on a {@link GenerateContentCandidate}.
 * @public
 */
export declare interface CitationMetadata {
    citations: Citation[];
}

/**
 * The results of code execution run by the model.
 *
 * @public
 */
export declare interface CodeExecutionResult {
    /**
     * The result of the code execution.
     */
    outcome?: Outcome;
    /**
     * The output from the code execution, or an error message
     * if it failed.
     */
    output?: string;
}

/**
 * Represents the code execution result from the model.
 *
 * @public
 */
export declare interface CodeExecutionResultPart {
    text?: never;
    inlineData?: never;
    functionCall?: never;
    functionResponse?: never;
    fileData: never;
    thought?: never;
    /* Excluded from this release type: thoughtSignature */
    executableCode?: never;
    codeExecutionResult?: CodeExecutionResult;
}

/**
 * A tool that enables the model to use code execution.
 *
 * @beta
 */
export declare interface CodeExecutionTool {
    /**
     * Specifies the Google Search configuration.
     * Currently, this is an empty object, but it's reserved for future configuration options.
     */
    codeExecution: {};
}

/**
 * Content type for both prompts and response candidates.
 * @public
 */
export declare interface Content {
    role: Role;
    parts: Part[];
}

/**
 * Params for calling {@link GenerativeModel.countTokens}
 * @public
 */
export declare interface CountTokensRequest {
    contents: Content[];
    /**
     * Instructions that direct the model to behave a certain way.
     */
    systemInstruction?: string | Part | Content;
    /**
     * {@link Tool} configuration.
     */
    tools?: Tool[];
    /**
     * Configuration options that control how the model generates a response.
     */
    generationConfig?: GenerationConfig;
}

/**
 * Response from calling {@link GenerativeModel.countTokens}.
 * @public
 */
export declare interface CountTokensResponse {
    /**
     * The total number of tokens counted across all instances from the request.
     */
    totalTokens: number;
    /**
     * @deprecated Use `totalTokens` instead. This property is undefined when using models greater than `gemini-1.5-*`.
     *
     * The total number of billable characters counted across all instances
     * from the request.
     */
    totalBillableCharacters?: number;
    /**
     * The breakdown, by modality, of how many tokens are consumed by the prompt.
     */
    promptTokensDetails?: ModalityTokenCount[];
}

/**
 * Details object that contains data originating from a bad HTTP response.
 *
 * @public
 */
export declare interface CustomErrorData {
    /** HTTP status code of the error response. */
    status?: number;
    /** HTTP status text of the error response. */
    statusText?: string;
    /** Response from a {@link GenerateContentRequest} */
    response?: GenerateContentResponse;
    /** Optional additional details about the error. */
    errorDetails?: ErrorDetails[];
}

/**
 * Protobuf google.type.Date
 * @public
 */
declare interface Date_2 {
    year: number;
    month: number;
    day: number;
}
export { Date_2 as Date }

/**
 * Response object wrapped with helper methods.
 *
 * @public
 */
export declare interface EnhancedGenerateContentResponse extends GenerateContentResponse {
    /**
     * Returns the text string from the response, if available.
     * Throws if the prompt or candidate was blocked.
     */
    text: () => string;
    /**
     * Aggregates and returns every {@link InlineDataPart} from the first candidate of
     * {@link GenerateContentResponse}.
     *
     * @throws If the prompt or candidate was blocked.
     */
    inlineDataParts: () => InlineDataPart[] | undefined;
    /**
     * Aggregates and returns every {@link FunctionCall} from the first candidate of
     * {@link GenerateContentResponse}.
     *
     * @throws If the prompt or candidate was blocked.
     */
    functionCalls: () => FunctionCall[] | undefined;
    /**
     * Aggregates and returns every {@link TextPart} with their `thought` property set
     * to `true` from the first candidate of {@link GenerateContentResponse}.
     *
     * @throws If the prompt or candidate was blocked.
     *
     * @remarks
     * Thought summaries provide a brief overview of the model's internal thinking process,
     * offering insight into how it arrived at the final answer. This can be useful for
     * debugging, understanding the model's reasoning, and verifying its accuracy.
     *
     * Thoughts will only be included if {@link ThinkingConfig.includeThoughts} is
     * set to `true`.
     */
    thoughtSummary: () => string | undefined;
    /**
     * Indicates whether inference happened on-device or in-cloud.
     *
     * @beta
     */
    inferenceSource?: InferenceSource;
}

/**
 * Details object that may be included in an error response.
 *
 * @public
 */
export declare interface ErrorDetails {
    '@type'?: string;
    /** The reason for the error. */
    reason?: string;
    /** The domain where the error occurred. */
    domain?: string;
    /** Additional metadata about the error. */
    metadata?: Record<string, unknown>;
    /** Any other relevant information about the error. */
    [key: string]: unknown;
}

/**
 * An interface for executable code returned by the model.
 *
 * @public
 */
export declare interface ExecutableCode {
    /**
     * The programming language of the code.
     */
    language?: Language;
    /**
     * The source code to be executed.
     */
    code?: string;
}

/**
 * Represents the code that is executed by the model.
 *
 * @public
 */
export declare interface ExecutableCodePart {
    text?: never;
    inlineData?: never;
    functionCall?: never;
    functionResponse?: never;
    fileData: never;
    thought?: never;
    /* Excluded from this release type: thoughtSignature */
    executableCode?: ExecutableCode;
    codeExecutionResult?: never;
}

/**
 * Data pointing to a file uploaded on Google Cloud Storage.
 * @public
 */
export declare interface FileData {
    mimeType: string;
    fileUri: string;
}

/**
 * Content part interface if the part represents {@link FileData}
 * @public
 */
export declare interface FileDataPart {
    text?: never;
    inlineData?: never;
    functionCall?: never;
    functionResponse?: never;
    fileData: FileData;
    thought?: boolean;
    /* Excluded from this release type: thoughtSignature */
    executableCode?: never;
    codeExecutionResult?: never;
}

/**
 * Reason that a candidate finished.
 * @public
 */
export declare const FinishReason: {
    /**
     * Natural stop point of the model or provided stop sequence.
     */
    readonly STOP: "STOP";
    /**
     * The maximum number of tokens as specified in the request was reached.
     */
    readonly MAX_TOKENS: "MAX_TOKENS";
    /**
     * The candidate content was flagged for safety reasons.
     */
    readonly SAFETY: "SAFETY";
    /**
     * The candidate content was flagged for recitation reasons.
     */
    readonly RECITATION: "RECITATION";
    /**
     * Unknown reason.
     */
    readonly OTHER: "OTHER";
    /**
     * The candidate content contained forbidden terms.
     */
    readonly BLOCKLIST: "BLOCKLIST";
    /**
     * The candidate content potentially contained prohibited content.
     */
    readonly PROHIBITED_CONTENT: "PROHIBITED_CONTENT";
    /**
     * The candidate content potentially contained Sensitive Personally Identifiable Information (SPII).
     */
    readonly SPII: "SPII";
    /**
     * The function call generated by the model was invalid.
     */
    readonly MALFORMED_FUNCTION_CALL: "MALFORMED_FUNCTION_CALL";
};

/**
 * Reason that a candidate finished.
 * @public
 */
export declare type FinishReason = (typeof FinishReason)[keyof typeof FinishReason];

/**
 * A predicted {@link FunctionCall} returned from the model
 * that contains a string representing the {@link FunctionDeclaration.name}
 * and a structured JSON object containing the parameters and their values.
 * @public
 */
export declare interface FunctionCall {
    /**
     * The id of the function call. This must be sent back in the associated {@link FunctionResponse}.
     *
     *
     * @remarks This property is only supported in the Gemini Developer API ({@link GoogleAIBackend}).
     * When using the Gemini Developer API ({@link GoogleAIBackend}), this property will be
     * `undefined`.
     */
    id?: string;
    name: string;
    args: object;
}

/**
 * @public
 */
export declare interface FunctionCallingConfig {
    mode?: FunctionCallingMode;
    allowedFunctionNames?: string[];
}

/**
 * @public
 */
export declare const FunctionCallingMode: {
    /**
     * Default model behavior; model decides to predict either a function call
     * or a natural language response.
     */
    readonly AUTO: "AUTO";
    /**
     * Model is constrained to always predicting a function call only.
     * If `allowed_function_names` is set, the predicted function call will be
     * limited to any one of `allowed_function_names`, else the predicted
     * function call will be any one of the provided `function_declarations`.
     */
    readonly ANY: "ANY";
    /**
     * Model will not predict any function call. Model behavior is same as when
     * not passing any function declarations.
     */
    readonly NONE: "NONE";
};

/**
 * @public
 */
export declare type FunctionCallingMode = (typeof FunctionCallingMode)[keyof typeof FunctionCallingMode];

/**
 * Content part interface if the part represents a {@link FunctionCall}.
 * @public
 */
export declare interface FunctionCallPart {
    text?: never;
    inlineData?: never;
    functionCall: FunctionCall;
    functionResponse?: never;
    thought?: boolean;
    /* Excluded from this release type: thoughtSignature */
    executableCode?: never;
    codeExecutionResult?: never;
}

/**
 * Structured representation of a function declaration as defined by the
 * {@link https://spec.openapis.org/oas/v3.0.3 | OpenAPI 3.0 specification}.
 * Included
 * in this declaration are the function name and parameters. This
 * `FunctionDeclaration` is a representation of a block of code that can be used
 * as a Tool by the model and executed by the client.
 * @public
 */
export declare interface FunctionDeclaration {
    /**
     * The name of the function to call. Must start with a letter or an
     * underscore. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with
     * a max length of 64.
     */
    name: string;
    /**
     * Description and purpose of the function. Model uses it to decide
     * how and whether to call the function.
     */
    description: string;
    /**
     * Optional. Describes the parameters to this function in JSON Schema Object
     * format. Reflects the Open API 3.03 Parameter Object. Parameter names are
     * case-sensitive. For a function with no parameters, this can be left unset.
     */
    parameters?: ObjectSchema | ObjectSchemaRequest;
    /**
     * Reference to an actual function to call. Specifying this will cause the
     * function to be called automatically when requested by the model.
     */
    functionReference?: Function;
}

/**
 * A `FunctionDeclarationsTool` is a piece of code that enables the system to
 * interact with external systems to perform an action, or set of actions,
 * outside of knowledge and scope of the model.
 * @public
 */
export declare interface FunctionDeclarationsTool {
    /**
     * Optional. One or more function declarations
     * to be passed to the model along with the current user query. Model may
     * decide to call a subset of these functions by populating
     * {@link FunctionCall} in the response. User should
     * provide a {@link FunctionResponse} for each
     * function call in the next turn. Based on the function responses, the model will
     * generate the final response back to the user. Maximum 64 function
     * declarations can be provided.
     */
    functionDeclarations?: FunctionDeclaration[];
}

/**
 * The result output from a {@link FunctionCall} that contains a string
 * representing the {@link FunctionDeclaration.name}
 * and a structured JSON object containing any output
 * from the function is used as context to the model.
 * This should contain the result of a {@link FunctionCall}
 * made based on model prediction.
 * @public
 */
export declare interface FunctionResponse {
    /**
     * The id of the {@link FunctionCall}.
     *
     * @remarks This property is only supported in the Gemini Developer API ({@link GoogleAIBackend}).
     * When using the Gemini Developer API ({@link GoogleAIBackend}), this property will be
     * `undefined`.
     */
    id?: string;
    name: string;
    response: object;
    parts?: Part[];
}

/**
 * Content part interface if the part represents {@link FunctionResponse}.
 * @public
 */
export declare interface FunctionResponsePart {
    text?: never;
    inlineData?: never;
    functionCall?: never;
    functionResponse: FunctionResponse;
    thought?: boolean;
    /* Excluded from this release type: thoughtSignature */
    executableCode?: never;
    codeExecutionResult?: never;
}

/**
 * A candidate returned as part of a {@link GenerateContentResponse}.
 * @public
 */
export declare interface GenerateContentCandidate {
    index: number;
    content: Content;
    finishReason?: FinishReason;
    finishMessage?: string;
    safetyRatings?: SafetyRating[];
    citationMetadata?: CitationMetadata;
    groundingMetadata?: GroundingMetadata;
    urlContextMetadata?: URLContextMetadata;
}

/**
 * Request sent through {@link GenerativeModel.generateContent}
 * @public
 */
export declare interface GenerateContentRequest extends BaseParams {
    contents: Content[];
    tools?: Tool[];
    toolConfig?: ToolConfig;
    systemInstruction?: string | Part | Content;
}

/**
 * Individual response from {@link GenerativeModel.generateContent} and
 * {@link GenerativeModel.generateContentStream}.
 * `generateContentStream()` will return one in each chunk until
 * the stream is done.
 * @public
 */
export declare interface GenerateContentResponse {
    candidates?: GenerateContentCandidate[];
    promptFeedback?: PromptFeedback;
    usageMetadata?: UsageMetadata;
}

/**
 * Result object returned from {@link GenerativeModel.generateContent} call.
 *
 * @public
 */
export declare interface GenerateContentResult {
    response: EnhancedGenerateContentResponse;
}

/**
 * Result object returned from {@link GenerativeModel.generateContentStream} call.
 * Iterate over `stream` to get chunks as they come in and/or
 * use the `response` promise to get the aggregated response when
 * the stream is done.
 *
 * @public
 */
export declare interface GenerateContentStreamResult {
    stream: AsyncGenerator<EnhancedGenerateContentResponse>;
    response: Promise<EnhancedGenerateContentResponse>;
}

/**
 * Config options for content-related requests
 * @public
 */
export declare interface GenerationConfig {
    candidateCount?: number;
    stopSequences?: string[];
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    /**
     * Output response MIME type of the generated candidate text.
     * Supported MIME types are `text/plain` (default, text output),
     * `application/json` (JSON response in the candidates), and
     * `text/x.enum`.
     */
    responseMimeType?: string;
    /**
     * Output response schema of the generated candidate text. This
     * value can be a class generated with a {@link Schema} static method
     * like `Schema.string()` or `Schema.object()` or it can be a plain
     * JS object matching the {@link SchemaRequest} interface.
     * <br/>Note: This only applies when the specified `responseMimeType` supports a schema; currently
     * this is limited to `application/json` and `text/x.enum`.
     */
    responseSchema?: TypedSchema | SchemaRequest;
    /**
     * Generation modalities to be returned in generation responses.
     *
     * @remarks
     *  - Multimodal response generation is only supported by some Gemini models and versions; see {@link https://firebase.google.com/docs/vertex-ai/models | model versions}.
     *  - Only image generation (`ResponseModality.IMAGE`) is supported.
     *
     * @beta
     */
    responseModalities?: ResponseModality[];
    /**
     * Configuration for "thinking" behavior of compatible Gemini models.
     */
    thinkingConfig?: ThinkingConfig;
}

/**
 * Interface for sending an image.
 * @public
 */
export declare interface GenerativeContentBlob {
    mimeType: string;
    /**
     * Image as a base64 string.
     */
    data: string;
}

/**
 * Class for generative model APIs.
 * @public
 */
export declare class GenerativeModel extends AIModel {
    private chromeAdapter?;
    generationConfig: GenerationConfig;
    safetySettings: SafetySetting[];
    requestOptions?: RequestOptions;
    tools?: Tool[];
    toolConfig?: ToolConfig;
    systemInstruction?: Content;
    constructor(ai: AI, modelParams: ModelParams, requestOptions?: RequestOptions, chromeAdapter?: ChromeAdapter | undefined);
    /**
     * Makes a single non-streaming call to the model
     * and returns an object containing a single {@link GenerateContentResponse}.
     */
    generateContent(request: GenerateContentRequest | string | Array<string | Part>, singleRequestOptions?: SingleRequestOptions): Promise<GenerateContentResult>;
    /**
     * Makes a single streaming call to the model
     * and returns an object containing an iterable stream that iterates
     * over all chunks in the streaming response as well as
     * a promise that returns the final aggregated response.
     */
    generateContentStream(request: GenerateContentRequest | string | Array<string | Part>, singleRequestOptions?: SingleRequestOptions): Promise<GenerateContentStreamResult>;
    /**
     * Gets a new {@link ChatSession} instance which can be used for
     * multi-turn chats.
     */
    startChat(startChatParams?: StartChatParams): ChatSession;
    /**
     * Counts the tokens in the provided request.
     */
    countTokens(request: CountTokensRequest | string | Array<string | Part>, singleRequestOptions?: SingleRequestOptions): Promise<CountTokensResponse>;
}

/**
 * Returns the default {@link AI} instance that is associated with the provided
 * {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new instance with the
 * default settings.
 *
 * @example
 * ```javascript
 * const ai = getAI(app);
 * ```
 *
 * @example
 * ```javascript
 * // Get an AI instance configured to use the Gemini Developer API (via Google AI).
 * const ai = getAI(app, { backend: new GoogleAIBackend() });
 * ```
 *
 * @example
 * ```javascript
 * // Get an AI instance configured to use the Vertex AI Gemini API.
 * const ai = getAI(app, { backend: new VertexAIBackend() });
 * ```
 *
 * @param app - The {@link @firebase/app#FirebaseApp} to use.
 * @param options - {@link AIOptions} that configure the AI instance.
 * @returns The default {@link AI} instance for the given {@link @firebase/app#FirebaseApp}.
 *
 * @public
 */
export declare function getAI(app?: FirebaseApp, options?: AIOptions): AI;

/**
 * Returns a {@link GenerativeModel} class with methods for inference
 * and other functionality.
 *
 * @public
 */
export declare function getGenerativeModel(ai: AI, modelParams: ModelParams | HybridParams, requestOptions?: RequestOptions): GenerativeModel;

/**
 * Returns an {@link ImagenModel} class with methods for using Imagen.
 *
 * Only Imagen 3 models (named `imagen-3.0-*`) are supported.
 *
 * @param ai - An {@link AI} instance.
 * @param modelParams - Parameters to use when making Imagen requests.
 * @param requestOptions - Additional options to use when making requests.
 *
 * @throws If the `apiKey` or `projectId` fields are missing in your
 * Firebase config.
 *
 * @public
 */
export declare function getImagenModel(ai: AI, modelParams: ImagenModelParams, requestOptions?: RequestOptions): ImagenModel;

/**
 * Returns a {@link LiveGenerativeModel} class for real-time, bidirectional communication.
 *
 * The Live API is only supported in modern browser windows and Node >= 22.
 *
 * @param ai - An {@link AI} instance.
 * @param modelParams - Parameters to use when setting up a {@link LiveSession}.
 * @throws If the `apiKey` or `projectId` fields are missing in your
 * Firebase config.
 *
 * @beta
 */
export declare function getLiveGenerativeModel(ai: AI, modelParams: LiveModelParams): LiveGenerativeModel;

/**
 * Returns a {@link TemplateGenerativeModel} class for executing server-side
 * templates.
 *
 * @param ai - An {@link AI} instance.
 * @param requestOptions - Additional options to use when making requests.
 *
 * @beta
 */
export declare function getTemplateGenerativeModel(ai: AI, requestOptions?: RequestOptions): TemplateGenerativeModel;

/**
 * Returns a {@link TemplateImagenModel} class for executing server-side
 * Imagen templates.
 *
 * @param ai - An {@link AI} instance.
 * @param requestOptions - Additional options to use when making requests.
 *
 * @beta
 */
export declare function getTemplateImagenModel(ai: AI, requestOptions?: RequestOptions): TemplateImagenModel;

/**
 * Configuration class for the Gemini Developer API.
 *
 * Use this with {@link AIOptions} when initializing the AI service via
 * {@link getAI | getAI()} to specify the Gemini Developer API as the backend.
 *
 * @public
 */
export declare class GoogleAIBackend extends Backend {
    /**
     * Creates a configuration object for the Gemini Developer API backend.
     */
    constructor();
    /* Excluded from this release type: _getModelPath */
    /* Excluded from this release type: _getTemplatePath */
}

/* Excluded from this release type: GoogleAICitationMetadata */

/* Excluded from this release type: GoogleAICountTokensRequest */

/* Excluded from this release type: GoogleAIGenerateContentCandidate */

/* Excluded from this release type: GoogleAIGenerateContentResponse */

/**
 * Specifies the Google Search configuration.
 *
 * @remarks Currently, this is an empty object, but it's reserved for future configuration options.
 *
 * @public
 */
export declare interface GoogleSearch {
}

/**
 * A tool that allows a Gemini model to connect to Google Search to access and incorporate
 * up-to-date information from the web into its responses.
 *
 * Important: If using Grounding with Google Search, you are required to comply with the
 * "Grounding with Google Search" usage requirements for your chosen API provider: {@link https://ai.google.dev/gemini-api/terms#grounding-with-google-search | Gemini Developer API}
 * or Vertex AI Gemini API (see {@link https://cloud.google.com/terms/service-terms | Service Terms}
 * section within the Service Specific Terms).
 *
 * @public
 */
export declare interface GoogleSearchTool {
    /**
     * Specifies the Google Search configuration.
     * Currently, this is an empty object, but it's reserved for future configuration options.
     *
     * When using this feature, you are required to comply with the "Grounding with Google Search"
     * usage requirements for your chosen API provider: {@link https://ai.google.dev/gemini-api/terms#grounding-with-google-search | Gemini Developer API}
     * or Vertex AI Gemini API (see {@link https://cloud.google.com/terms/service-terms | Service Terms}
     * section within the Service Specific Terms).
     */
    googleSearch: GoogleSearch;
}

/**
 * Represents a chunk of retrieved data that supports a claim in the model's response. This is part
 * of the grounding information provided when grounding is enabled.
 *
 * @public
 */
export declare interface GroundingChunk {
    /**
     * Contains details if the grounding chunk is from a web source.
     */
    web?: WebGroundingChunk;
}

/**
 * Metadata returned when grounding is enabled.
 *
 * Currently, only Grounding with Google Search is supported (see {@link GoogleSearchTool}).
 *
 * Important: If using Grounding with Google Search, you are required to comply with the
 * "Grounding with Google Search" usage requirements for your chosen API provider: {@link https://ai.google.dev/gemini-api/terms#grounding-with-google-search | Gemini Developer API}
 * or Vertex AI Gemini API (see {@link https://cloud.google.com/terms/service-terms | Service Terms}
 * section within the Service Specific Terms).
 *
 * @public
 */
export declare interface GroundingMetadata {
    /**
     * Google Search entry point for web searches. This contains an HTML/CSS snippet that must be
     * embedded in an app to display a Google Search entry point for follow-up web searches related to
     * a model's "Grounded Response".
     */
    searchEntryPoint?: SearchEntrypoint;
    /**
     * A list of {@link GroundingChunk} objects. Each chunk represents a piece of retrieved content
     * (for example, from a web page). that the model used to ground its response.
     */
    groundingChunks?: GroundingChunk[];
    /**
     * A list of {@link GroundingSupport} objects. Each object details how specific segments of the
     * model's response are supported by the `groundingChunks`.
     */
    groundingSupports?: GroundingSupport[];
    /**
     * A list of web search queries that the model performed to gather the grounding information.
     * These can be used to allow users to explore the search results themselves.
     */
    webSearchQueries?: string[];
    /**
     * @deprecated Use {@link GroundingSupport} instead.
     */
    retrievalQueries?: string[];
}

/**
 * Provides information about how a specific segment of the model's response is supported by the
 * retrieved grounding chunks.
 *
 * @public
 */
export declare interface GroundingSupport {
    /**
     * Specifies the segment of the model's response content that this grounding support pertains to.
     */
    segment?: Segment;
    /**
     * A list of indices that refer to specific {@link GroundingChunk} objects within the
     * {@link GroundingMetadata.groundingChunks} array. These referenced chunks
     * are the sources that support the claim made in the associated `segment` of the response.
     * For example, an array `[1, 3, 4]` means that `groundingChunks[1]`, `groundingChunks[3]`,
     * and `groundingChunks[4]` are the retrieved content supporting this part of the response.
     */
    groundingChunkIndices?: number[];
}

/**
 * This property is not supported in the Gemini Developer API ({@link GoogleAIBackend}).
 *
 * @public
 */
export declare const HarmBlockMethod: {
    /**
     * The harm block method uses both probability and severity scores.
     */
    readonly SEVERITY: "SEVERITY";
    /**
     * The harm block method uses the probability score.
     */
    readonly PROBABILITY: "PROBABILITY";
};

/**
 * This property is not supported in the Gemini Developer API ({@link GoogleAIBackend}).
 *
 * @public
 */
export declare type HarmBlockMethod = (typeof HarmBlockMethod)[keyof typeof HarmBlockMethod];

/**
 * Threshold above which a prompt or candidate will be blocked.
 * @public
 */
export declare const HarmBlockThreshold: {
    /**
     * Content with `NEGLIGIBLE` will be allowed.
     */
    readonly BLOCK_LOW_AND_ABOVE: "BLOCK_LOW_AND_ABOVE";
    /**
     * Content with `NEGLIGIBLE` and `LOW` will be allowed.
     */
    readonly BLOCK_MEDIUM_AND_ABOVE: "BLOCK_MEDIUM_AND_ABOVE";
    /**
     * Content with `NEGLIGIBLE`, `LOW`, and `MEDIUM` will be allowed.
     */
    readonly BLOCK_ONLY_HIGH: "BLOCK_ONLY_HIGH";
    /**
     * All content will be allowed.
     */
    readonly BLOCK_NONE: "BLOCK_NONE";
    /**
     * All content will be allowed. This is the same as `BLOCK_NONE`, but the metadata corresponding
     * to the {@link (HarmCategory:type)} will not be present in the response.
     */
    readonly OFF: "OFF";
};

/**
 * Threshold above which a prompt or candidate will be blocked.
 * @public
 */
export declare type HarmBlockThreshold = (typeof HarmBlockThreshold)[keyof typeof HarmBlockThreshold];

/**
 * Harm categories that would cause prompts or candidates to be blocked.
 * @public
 */
export declare const HarmCategory: {
    readonly HARM_CATEGORY_HATE_SPEECH: "HARM_CATEGORY_HATE_SPEECH";
    readonly HARM_CATEGORY_SEXUALLY_EXPLICIT: "HARM_CATEGORY_SEXUALLY_EXPLICIT";
    readonly HARM_CATEGORY_HARASSMENT: "HARM_CATEGORY_HARASSMENT";
    readonly HARM_CATEGORY_DANGEROUS_CONTENT: "HARM_CATEGORY_DANGEROUS_CONTENT";
};

/**
 * Harm categories that would cause prompts or candidates to be blocked.
 * @public
 */
export declare type HarmCategory = (typeof HarmCategory)[keyof typeof HarmCategory];

/**
 * Probability that a prompt or candidate matches a harm category.
 * @public
 */
export declare const HarmProbability: {
    /**
     * Content has a negligible chance of being unsafe.
     */
    readonly NEGLIGIBLE: "NEGLIGIBLE";
    /**
     * Content has a low chance of being unsafe.
     */
    readonly LOW: "LOW";
    /**
     * Content has a medium chance of being unsafe.
     */
    readonly MEDIUM: "MEDIUM";
    /**
     * Content has a high chance of being unsafe.
     */
    readonly HIGH: "HIGH";
};

/**
 * Probability that a prompt or candidate matches a harm category.
 * @public
 */
export declare type HarmProbability = (typeof HarmProbability)[keyof typeof HarmProbability];

/**
 * Harm severity levels.
 * @public
 */
export declare const HarmSeverity: {
    /**
     * Negligible level of harm severity.
     */
    readonly HARM_SEVERITY_NEGLIGIBLE: "HARM_SEVERITY_NEGLIGIBLE";
    /**
     * Low level of harm severity.
     */
    readonly HARM_SEVERITY_LOW: "HARM_SEVERITY_LOW";
    /**
     * Medium level of harm severity.
     */
    readonly HARM_SEVERITY_MEDIUM: "HARM_SEVERITY_MEDIUM";
    /**
     * High level of harm severity.
     */
    readonly HARM_SEVERITY_HIGH: "HARM_SEVERITY_HIGH";
    /**
     * Harm severity is not supported.
     *
     * @remarks
     * The GoogleAI backend does not support `HarmSeverity`, so this value is used as a fallback.
     */
    readonly HARM_SEVERITY_UNSUPPORTED: "HARM_SEVERITY_UNSUPPORTED";
};

/**
 * Harm severity levels.
 * @public
 */
export declare type HarmSeverity = (typeof HarmSeverity)[keyof typeof HarmSeverity];

/**
 * Configures hybrid inference.
 * @beta
 */
export declare interface HybridParams {
    /**
     * Specifies on-device or in-cloud inference. Defaults to prefer on-device.
     */
    mode: InferenceMode;
    /**
     * Optional. Specifies advanced params for on-device inference.
     */
    onDeviceParams?: OnDeviceParams;
    /**
     * Optional. Specifies advanced params for in-cloud inference.
     */
    inCloudParams?: ModelParams;
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
 * @public
 */
export declare const ImagenAspectRatio: {
    /**
     * Square (1:1) aspect ratio.
     */
    readonly SQUARE: "1:1";
    /**
     * Landscape (3:4) aspect ratio.
     */
    readonly LANDSCAPE_3x4: "3:4";
    /**
     * Portrait (4:3) aspect ratio.
     */
    readonly PORTRAIT_4x3: "4:3";
    /**
     * Landscape (16:9) aspect ratio.
     */
    readonly LANDSCAPE_16x9: "16:9";
    /**
     * Portrait (9:16) aspect ratio.
     */
    readonly PORTRAIT_9x16: "9:16";
};

/**
 * Aspect ratios for Imagen images.
 *
 * To specify an aspect ratio for generated images, set the `aspectRatio` property in your
 * {@link ImagenGenerationConfig}.
 *
 * See the {@link http://firebase.google.com/docs/vertex-ai/generate-images | documentation }
 * for more details and examples of the supported aspect ratios.
 *
 * @public
 */
export declare type ImagenAspectRatio = (typeof ImagenAspectRatio)[keyof typeof ImagenAspectRatio];

/**
 * An image generated by Imagen, stored in a Cloud Storage for Firebase bucket.
 *
 * This feature is not available yet.
 * @public
 */
export declare interface ImagenGCSImage {
    /**
     * The MIME type of the image; either `"image/png"` or `"image/jpeg"`.
     *
     * To request a different format, set the `imageFormat` property in your {@link ImagenGenerationConfig}.
     */
    mimeType: string;
    /**
     * The URI of the file stored in a Cloud Storage for Firebase bucket.
     *
     * @example `"gs://bucket-name/path/sample_0.jpg"`.
     */
    gcsURI: string;
}

/**
 * Configuration options for generating images with Imagen.
 *
 * See the {@link http://firebase.google.com/docs/vertex-ai/generate-images-imagen | documentation} for
 * more details.
 *
 * @public
 */
export declare interface ImagenGenerationConfig {
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
 * The response from a request to generate images with Imagen.
 *
 * @public
 */
export declare interface ImagenGenerationResponse<T extends ImagenInlineImage | ImagenGCSImage> {
    /**
     * The images generated by Imagen.
     *
     * The number of images generated may be fewer than the number requested if one or more were
     * filtered out; see `filteredReason`.
     */
    images: T[];
    /**
     * The reason that images were filtered out. This property will only be defined if one
     * or more images were filtered.
     *
     * Images may be filtered out due to the {@link (ImagenSafetyFilterLevel:type)},
     * {@link (ImagenPersonFilterLevel:type)}, or filtering included in the model.
     * The filter levels may be adjusted in your {@link ImagenSafetySettings}.
     *
     * See the {@link https://cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen | Responsible AI and usage guidelines for Imagen}
     * for more details.
     */
    filteredReason?: string;
}

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
/**
 * Defines the image format for images generated by Imagen.
 *
 * Use this class to specify the desired format (JPEG or PNG) and compression quality
 * for images generated by Imagen. This is typically included as part of
 * {@link ImagenModelParams}.
 *
 * @example
 * ```javascript
 * const imagenModelParams = {
 *   // ... other ImagenModelParams
 *   imageFormat: ImagenImageFormat.jpeg(75) // JPEG with a compression level of 75.
 * }
 * ```
 *
 * @public
 */
export declare class ImagenImageFormat {
    /**
     * The MIME type.
     */
    mimeType: string;
    /**
     * The level of compression (a number between 0 and 100).
     */
    compressionQuality?: number;
    private constructor();
    /**
     * Creates an {@link ImagenImageFormat} for a JPEG image.
     *
     * @param compressionQuality - The level of compression (a number between 0 and 100).
     * @returns An {@link ImagenImageFormat} object for a JPEG image.
     *
     * @public
     */
    static jpeg(compressionQuality?: number): ImagenImageFormat;
    /**
     * Creates an {@link ImagenImageFormat} for a PNG image.
     *
     * @returns An {@link ImagenImageFormat} object for a PNG image.
     *
     * @public
     */
    static png(): ImagenImageFormat;
}

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
/**
 * An image generated by Imagen, represented as inline data.
 *
 * @public
 */
export declare interface ImagenInlineImage {
    /**
     * The MIME type of the image; either `"image/png"` or `"image/jpeg"`.
     *
     * To request a different format, set the `imageFormat` property in your {@link ImagenGenerationConfig}.
     */
    mimeType: string;
    /**
     * The base64-encoded image data.
     */
    bytesBase64Encoded: string;
}

/**
 * Class for Imagen model APIs.
 *
 * This class provides methods for generating images using the Imagen model.
 *
 * @example
 * ```javascript
 * const imagen = new ImagenModel(
 *   ai,
 *   {
 *     model: 'imagen-3.0-generate-002'
 *   }
 * );
 *
 * const response = await imagen.generateImages('A photo of a cat');
 * if (response.images.length > 0) {
 *   console.log(response.images[0].bytesBase64Encoded);
 * }
 * ```
 *
 * @public
 */
export declare class ImagenModel extends AIModel {
    requestOptions?: RequestOptions | undefined;
    /**
     * The Imagen generation configuration.
     */
    generationConfig?: ImagenGenerationConfig;
    /**
     * Safety settings for filtering inappropriate content.
     */
    safetySettings?: ImagenSafetySettings;
    /**
     * Constructs a new instance of the {@link ImagenModel} class.
     *
     * @param ai - an {@link AI} instance.
     * @param modelParams - Parameters to use when making requests to Imagen.
     * @param requestOptions - Additional options to use when making requests.
     *
     * @throws If the `apiKey` or `projectId` fields are missing in your
     * Firebase config.
     */
    constructor(ai: AI, modelParams: ImagenModelParams, requestOptions?: RequestOptions | undefined);
    /**
     * Generates images using the Imagen model and returns them as
     * base64-encoded strings.
     *
     * @param prompt - A text prompt describing the image(s) to generate.
     * @returns A promise that resolves to an {@link ImagenGenerationResponse}
     * object containing the generated images.
     *
     * @throws If the request to generate images fails. This happens if the
     * prompt is blocked.
     *
     * @remarks
     * If the prompt was not blocked, but one or more of the generated images were filtered, the
     * returned object will have a `filteredReason` property.
     * If all images are filtered, the `images` array will be empty.
     *
     * @public
     */
    generateImages(prompt: string, singleRequestOptions?: SingleRequestOptions): Promise<ImagenGenerationResponse<ImagenInlineImage>>;
    /* Excluded from this release type: generateImagesGCS */
}

/**
 * Parameters for configuring an {@link ImagenModel}.
 *
 * @public
 */
export declare interface ImagenModelParams {
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
 * A filter level controlling whether generation of images containing people or faces is allowed.
 *
 * See the <a href="http://firebase.google.com/docs/vertex-ai/generate-images">personGeneration</a>
 * documentation for more details.
 *
 * @public
 */
export declare const ImagenPersonFilterLevel: {
    /**
     * Disallow generation of images containing people or faces; images of people are filtered out.
     */
    readonly BLOCK_ALL: "dont_allow";
    /**
     * Allow generation of images containing adults only; images of children are filtered out.
     *
     * Generation of images containing people or faces may require your use case to be
     * reviewed and approved by Cloud support; see the {@link https://cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen#person-face-gen | Responsible AI and usage guidelines}
     * for more details.
     */
    readonly ALLOW_ADULT: "allow_adult";
    /**
     * Allow generation of images containing adults only; images of children are filtered out.
     *
     * Generation of images containing people or faces may require your use case to be
     * reviewed and approved by Cloud support; see the {@link https://cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen#person-face-gen | Responsible AI and usage guidelines}
     * for more details.
     */
    readonly ALLOW_ALL: "allow_all";
};

/**
 * A filter level controlling whether generation of images containing people or faces is allowed.
 *
 * See the <a href="http://firebase.google.com/docs/vertex-ai/generate-images">personGeneration</a>
 * documentation for more details.
 *
 * @public
 */
export declare type ImagenPersonFilterLevel = (typeof ImagenPersonFilterLevel)[keyof typeof ImagenPersonFilterLevel];

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
 * @public
 */
export declare const ImagenSafetyFilterLevel: {
    /**
     * The most aggressive filtering level; most strict blocking.
     */
    readonly BLOCK_LOW_AND_ABOVE: "block_low_and_above";
    /**
     * Blocks some sensitive prompts and responses.
     */
    readonly BLOCK_MEDIUM_AND_ABOVE: "block_medium_and_above";
    /**
     * Blocks few sensitive prompts and responses.
     */
    readonly BLOCK_ONLY_HIGH: "block_only_high";
    /**
     * The least aggressive filtering level; blocks very few sensitive prompts and responses.
     *
     * Access to this feature is restricted and may require your case to be reviewed and approved by
     * Cloud support.
     */
    readonly BLOCK_NONE: "block_none";
};

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
 * @public
 */
export declare type ImagenSafetyFilterLevel = (typeof ImagenSafetyFilterLevel)[keyof typeof ImagenSafetyFilterLevel];

/**
 * Settings for controlling the aggressiveness of filtering out sensitive content.
 *
 * See the {@link http://firebase.google.com/docs/vertex-ai/generate-images | documentation }
 * for more details.
 *
 * @public
 */
export declare interface ImagenSafetySettings {
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
 * Determines whether inference happens on-device or in-cloud.
 *
 * @remarks
 * <b>PREFER_ON_DEVICE:</b> Attempt to make inference calls using an
 * on-device model. If on-device inference is not available, the SDK
 * will fall back to using a cloud-hosted model.
 * <br/>
 * <b>ONLY_ON_DEVICE:</b> Only attempt to make inference calls using an
 * on-device model. The SDK will not fall back to a cloud-hosted model.
 * If on-device inference is not available, inference methods will throw.
 * <br/>
 * <b>ONLY_IN_CLOUD:</b> Only attempt to make inference calls using a
 * cloud-hosted model. The SDK will not fall back to an on-device model.
 * <br/>
 * <b>PREFER_IN_CLOUD:</b> Attempt to make inference calls to a
 * cloud-hosted model. If not available, the SDK will fall back to an
 * on-device model.
 *
 * @beta
 */
export declare const InferenceMode: {
    readonly PREFER_ON_DEVICE: "prefer_on_device";
    readonly ONLY_ON_DEVICE: "only_on_device";
    readonly ONLY_IN_CLOUD: "only_in_cloud";
    readonly PREFER_IN_CLOUD: "prefer_in_cloud";
};

/**
 * Determines whether inference happens on-device or in-cloud.
 *
 * @beta
 */
export declare type InferenceMode = (typeof InferenceMode)[keyof typeof InferenceMode];

/**
 * Indicates whether inference happened on-device or in-cloud.
 *
 * @beta
 */
export declare const InferenceSource: {
    readonly ON_DEVICE: "on_device";
    readonly IN_CLOUD: "in_cloud";
};

/**
 * Indicates whether inference happened on-device or in-cloud.
 *
 * @beta
 */
export declare type InferenceSource = (typeof InferenceSource)[keyof typeof InferenceSource];

/**
 * Content part interface if the part represents an image.
 * @public
 */
export declare interface InlineDataPart {
    text?: never;
    inlineData: GenerativeContentBlob;
    functionCall?: never;
    functionResponse?: never;
    /**
     * Applicable if `inlineData` is a video.
     */
    videoMetadata?: VideoMetadata;
    thought?: boolean;
    /* Excluded from this release type: thoughtSignature */
    executableCode?: never;
    codeExecutionResult?: never;
}

/**
 * Schema class for "integer" types.
 * @public
 */
export declare class IntegerSchema extends Schema {
    constructor(schemaParams?: SchemaParams);
}

/**
 * The programming language of the code.
 *
 * @public
 */
export declare const Language: {
    UNSPECIFIED: string;
    PYTHON: string;
};

/**
 * The programming language of the code.
 *
 * @public
 */
export declare type Language = (typeof Language)[keyof typeof Language];

/**
 * Configures the creation of an on-device language model session.
 * @beta
 */
export declare interface LanguageModelCreateCoreOptions {
    topK?: number;
    temperature?: number;
    expectedInputs?: LanguageModelExpected[];
}

/**
 * Configures the creation of an on-device language model session.
 * @beta
 */
export declare interface LanguageModelCreateOptions extends LanguageModelCreateCoreOptions {
    signal?: AbortSignal;
    initialPrompts?: LanguageModelMessage[];
}

/**
 * Options for the expected inputs for an on-device language model.
 * @beta
 */ export declare interface LanguageModelExpected {
    type: LanguageModelMessageType;
    languages?: string[];
}

/**
 * An on-device language model message.
 * @beta
 */
export declare interface LanguageModelMessage {
    role: LanguageModelMessageRole;
    content: LanguageModelMessageContent[];
}

/**
 * An on-device language model content object.
 * @beta
 */
export declare interface LanguageModelMessageContent {
    type: LanguageModelMessageType;
    value: LanguageModelMessageContentValue;
}

/**
 * Content formats that can be provided as on-device message content.
 * @beta
 */
export declare type LanguageModelMessageContentValue = ImageBitmapSource | AudioBuffer | BufferSource | string;

/**
 * Allowable roles for on-device language model usage.
 * @beta
 */
export declare type LanguageModelMessageRole = 'system' | 'user' | 'assistant';

/**
 * Allowable types for on-device language model messages.
 * @beta
 */
export declare type LanguageModelMessageType = 'text' | 'image' | 'audio';

/**
 * Options for an on-device language model prompt.
 * @beta
 */
export declare interface LanguageModelPromptOptions {
    responseConstraint?: object;
}

/**
 * Configuration parameters used by {@link LiveGenerativeModel} to control live content generation.
 *
 * @beta
 */
export declare interface LiveGenerationConfig {
    /**
     * Configuration for speech synthesis.
     */
    speechConfig?: SpeechConfig;
    /**
     * Specifies the maximum number of tokens that can be generated in the response. The number of
     * tokens per word varies depending on the language outputted. Is unbounded by default.
     */
    maxOutputTokens?: number;
    /**
     * Controls the degree of randomness in token selection. A `temperature` value of 0 means that the highest
     * probability tokens are always selected. In this case, responses for a given prompt are mostly
     * deterministic, but a small amount of variation is still possible.
     */
    temperature?: number;
    /**
     * Changes how the model selects tokens for output. Tokens are
     * selected from the most to least probable until the sum of their probabilities equals the `topP`
     * value. For example, if tokens A, B, and C have probabilities of 0.3, 0.2, and 0.1 respectively
     * and the `topP` value is 0.5, then the model will select either A or B as the next token by using
     * the `temperature` and exclude C as a candidate. Defaults to 0.95 if unset.
     */
    topP?: number;
    /**
     * Changes how the model selects token for output. A `topK` value of 1 means the select token is
     * the most probable among all tokens in the model's vocabulary, while a `topK` value 3 means that
     * the next token is selected from among the 3 most probably using probabilities sampled. Tokens
     * are then further filtered with the highest selected `temperature` sampling. Defaults to 40
     * if unspecified.
     */
    topK?: number;
    /**
     * Positive penalties.
     */
    presencePenalty?: number;
    /**
     * Frequency penalties.
     */
    frequencyPenalty?: number;
    /**
     * The modalities of the response.
     */
    responseModalities?: ResponseModality[];
    /**
     * Enables transcription of audio input.
     *
     * When enabled, the model will respond with transcriptions of your audio input in the `inputTranscriptions` property
     * in {@link LiveServerContent} messages. Note that the transcriptions are broken up across
     * messages, so you may only receive small amounts of text per message. For example, if you ask the model
     * "How are you today?", the model may transcribe that input across three messages, broken up as "How a", "re yo", "u today?".
     */
    inputAudioTranscription?: AudioTranscriptionConfig;
    /**
     * Enables transcription of audio input.
     *
     * When enabled, the model will respond with transcriptions of its audio output in the `outputTranscription` property
     * in {@link LiveServerContent} messages. Note that the transcriptions are broken up across
     * messages, so you may only receive small amounts of text per message. For example, if the model says
     * "How are you today?", the model may transcribe that output across three messages, broken up as "How a", "re yo", "u today?".
     */
    outputAudioTranscription?: AudioTranscriptionConfig;
}

/**
 * Class for Live generative model APIs. The Live API enables low-latency, two-way multimodal
 * interactions with Gemini.
 *
 * This class should only be instantiated with {@link getLiveGenerativeModel}.
 *
 * @beta
 */
export declare class LiveGenerativeModel extends AIModel {
    /* Excluded from this release type: _webSocketHandler */
    generationConfig: LiveGenerationConfig;
    tools?: Tool[];
    toolConfig?: ToolConfig;
    systemInstruction?: Content;
    /* Excluded from this release type: __constructor */
    /**
     * Starts a {@link LiveSession}.
     *
     * @returns A {@link LiveSession}.
     * @throws If the connection failed to be established with the server.
     *
     * @beta
     */
    connect(): Promise<LiveSession>;
}

/**
 * Params passed to {@link getLiveGenerativeModel}.
 * @beta
 */
export declare interface LiveModelParams {
    model: string;
    generationConfig?: LiveGenerationConfig;
    tools?: Tool[];
    toolConfig?: ToolConfig;
    systemInstruction?: string | Part | Content;
}

/**
 * The types of responses that can be returned by {@link LiveSession.receive}.
 *
 * @beta
 */
export declare const LiveResponseType: {
    SERVER_CONTENT: string;
    TOOL_CALL: string;
    TOOL_CALL_CANCELLATION: string;
    GOING_AWAY_NOTICE: string;
};

/**
 * The types of responses that can be returned by {@link LiveSession.receive}.
 * This is a property on all messages that can be used for type narrowing. This property is not
 * returned by the server, it is assigned to a server message object once it's parsed.
 *
 * @beta
 */
export declare type LiveResponseType = (typeof LiveResponseType)[keyof typeof LiveResponseType];

/**
 * An incremental content update from the model.
 *
 * @beta
 */
export declare interface LiveServerContent {
    type: 'serverContent';
    /**
     * The content that the model has generated as part of the current conversation with the user.
     */
    modelTurn?: Content;
    /**
     * Indicates whether the turn is complete. This is `undefined` if the turn is not complete.
     */
    turnComplete?: boolean;
    /**
     * Indicates whether the model was interrupted by the client. An interruption occurs when
     * the client sends a message before the model finishes it's turn. This is `undefined` if the
     * model was not interrupted.
     */
    interrupted?: boolean;
    /**
     * Transcription of the audio that was input to the model.
     */
    inputTranscription?: Transcription;
    /**
     * Transcription of the audio output from the model.
     */
    outputTranscription?: Transcription;
}

/**
 * Notification that the server will not be able to service the client soon.
 *
 * @beta
 */
export declare interface LiveServerGoingAwayNotice {
    type: 'goingAwayNotice';
    /**
     * The remaining time (in seconds) before the connection will be terminated.
     */
    timeLeft: number;
}

/**
 * A request from the model for the client to execute one or more functions.
 *
 * @beta
 */
export declare interface LiveServerToolCall {
    type: 'toolCall';
    /**
     * An array of function calls to run.
     */
    functionCalls: FunctionCall[];
}

/**
 * Notification to cancel a previous function call triggered by {@link LiveServerToolCall}.
 *
 * @beta
 */
export declare interface LiveServerToolCallCancellation {
    type: 'toolCallCancellation';
    /**
     * IDs of function calls that were cancelled. These refer to the `id` property of a {@link FunctionCall}.
     */
    functionIds: string[];
}

/**
 * Represents an active, real-time, bidirectional conversation with the model.
 *
 * This class should only be instantiated by calling {@link LiveGenerativeModel.connect}.
 *
 * @beta
 */
export declare class LiveSession {
    private webSocketHandler;
    private serverMessages;
    /**
     * Indicates whether this Live session is closed.
     *
     * @beta
     */
    isClosed: boolean;
    /**
     * Indicates whether this Live session is being controlled by an `AudioConversationController`.
     *
     * @beta
     */
    inConversation: boolean;
    /* Excluded from this release type: __constructor */
    /**
     * Sends content to the server.
     *
     * @param request - The message to send to the model.
     * @param turnComplete - Indicates if the turn is complete. Defaults to false.
     * @throws If this session has been closed.
     *
     * @beta
     */
    send(request: string | Array<string | Part>, turnComplete?: boolean): Promise<void>;
    /**
     * Sends text to the server in realtime.
     *
     * @example
     * ```javascript
     * liveSession.sendTextRealtime("Hello, how are you?");
     * ```
     *
     * @param text - The text data to send.
     * @throws If this session has been closed.
     *
     * @beta
     */
    sendTextRealtime(text: string): Promise<void>;
    /**
     * Sends audio data to the server in realtime.
     *
     * @remarks The server requires that the audio data is base64-encoded 16-bit PCM at 16kHz
     * little-endian.
     *
     * @example
     * ```javascript
     * // const pcmData = ... base64-encoded 16-bit PCM at 16kHz little-endian.
     * const blob = { mimeType: "audio/pcm", data: pcmData };
     * liveSession.sendAudioRealtime(blob);
     * ```
     *
     * @param blob - The base64-encoded PCM data to send to the server in realtime.
     * @throws If this session has been closed.
     *
     * @beta
     */
    sendAudioRealtime(blob: GenerativeContentBlob): Promise<void>;
    /**
     * Sends video data to the server in realtime.
     *
     * @remarks The server requires that the video is sent as individual video frames at 1 FPS. It
     * is recommended to set `mimeType` to `image/jpeg`.
     *
     * @example
     * ```javascript
     * // const videoFrame = ... base64-encoded JPEG data
     * const blob = { mimeType: "image/jpeg", data: videoFrame };
     * liveSession.sendVideoRealtime(blob);
     * ```
     * @param blob - The base64-encoded video data to send to the server in realtime.
     * @throws If this session has been closed.
     *
     * @beta
     */
    sendVideoRealtime(blob: GenerativeContentBlob): Promise<void>;
    /**
     * Sends function responses to the server.
     *
     * @param functionResponses - The function responses to send.
     * @throws If this session has been closed.
     *
     * @beta
     */
    sendFunctionResponses(functionResponses: FunctionResponse[]): Promise<void>;
    /**
     * Yields messages received from the server.
     * This can only be used by one consumer at a time.
     *
     * @returns An `AsyncGenerator` that yields server messages as they arrive.
     * @throws If the session is already closed, or if we receive a response that we don't support.
     *
     * @beta
     */
    receive(): AsyncGenerator<LiveServerContent | LiveServerToolCall | LiveServerToolCallCancellation | LiveServerGoingAwayNotice>;
    /**
     * Closes this session.
     * All methods on this session will throw an error once this resolves.
     *
     * @beta
     */
    close(): Promise<void>;
    /**
     * Sends realtime input to the server.
     *
     * @deprecated Use `sendTextRealtime()`, `sendAudioRealtime()`, and `sendVideoRealtime()` instead.
     *
     * @param mediaChunks - The media chunks to send.
     * @throws If this session has been closed.
     *
     * @beta
     */
    sendMediaChunks(mediaChunks: GenerativeContentBlob[]): Promise<void>;
    /**
     * @deprecated Use `sendTextRealtime()`, `sendAudioRealtime()`, and `sendVideoRealtime()` instead.
     *
     * Sends a stream of {@link GenerativeContentBlob}.
     *
     * @param mediaChunkStream - The stream of {@link GenerativeContentBlob} to send.
     * @throws If this session has been closed.
     *
     * @beta
     */
    sendMediaStream(mediaChunkStream: ReadableStream<GenerativeContentBlob>): Promise<void>;
}

/**
 * Content part modality.
 * @public
 */
export declare const Modality: {
    /**
     * Unspecified modality.
     */
    readonly MODALITY_UNSPECIFIED: "MODALITY_UNSPECIFIED";
    /**
     * Plain text.
     */
    readonly TEXT: "TEXT";
    /**
     * Image.
     */
    readonly IMAGE: "IMAGE";
    /**
     * Video.
     */
    readonly VIDEO: "VIDEO";
    /**
     * Audio.
     */
    readonly AUDIO: "AUDIO";
    /**
     * Document (for example, PDF).
     */
    readonly DOCUMENT: "DOCUMENT";
};

/**
 * Content part modality.
 * @public
 */
export declare type Modality = (typeof Modality)[keyof typeof Modality];

/**
 * Represents token counting info for a single modality.
 *
 * @public
 */
export declare interface ModalityTokenCount {
    /** The modality associated with this token count. */
    modality: Modality;
    /** The number of tokens counted. */
    tokenCount: number;
}

/**
 * Params passed to {@link getGenerativeModel}.
 * @public
 */
export declare interface ModelParams extends BaseParams {
    model: string;
    tools?: Tool[];
    toolConfig?: ToolConfig;
    systemInstruction?: string | Part | Content;
}

/**
 * Schema class for "number" types.
 * @public
 */
export declare class NumberSchema extends Schema {
    constructor(schemaParams?: SchemaParams);
}

/**
 * Schema class for "object" types.
 * The `properties` param must be a map of `Schema` objects.
 * @public
 */
export declare class ObjectSchema extends Schema {
    properties: {
        [k: string]: TypedSchema;
    };
    optionalProperties: string[];
    constructor(schemaParams: SchemaParams, properties: {
        [k: string]: TypedSchema;
    }, optionalProperties?: string[]);
    /* Excluded from this release type: toJSON */
}

/**
 * Interface for JSON parameters in a schema of {@link (SchemaType:type)}
 * "object" when not using the `Schema.object()` helper.
 * @public
 */
export declare interface ObjectSchemaRequest extends SchemaRequest {
    type: 'object';
    /**
     * This is not a property accepted in the final request to the backend, but is
     * a client-side convenience property that is only usable by constructing
     * a schema through the `Schema.object()` helper method. Populating this
     * property will cause response errors if the object is not wrapped with
     * `Schema.object()`.
     */
    optionalProperties?: never;
}

/**
 * Encapsulates configuration for on-device inference.
 *
 * @beta
 */
export declare interface OnDeviceParams {
    createOptions?: LanguageModelCreateOptions;
    promptOptions?: LanguageModelPromptOptions;
}

/**
 * Represents the result of the code execution.
 *
 * @public
 */
export declare const Outcome: {
    UNSPECIFIED: string;
    OK: string;
    FAILED: string;
    DEADLINE_EXCEEDED: string;
};

/**
 * Represents the result of the code execution.
 *
 * @public
 */
export declare type Outcome = (typeof Outcome)[keyof typeof Outcome];

/**
 * Content part - includes text, image/video, or function call/response
 * part types.
 * @public
 */
export declare type Part = TextPart | InlineDataPart | FunctionCallPart | FunctionResponsePart | FileDataPart | ExecutableCodePart | CodeExecutionResultPart;

/**
 * Possible roles.
 * @public
 */
export declare const POSSIBLE_ROLES: readonly ["user", "model", "function", "system"];

/**
 * Configuration for a pre-built voice.
 *
 * @beta
 */
export declare interface PrebuiltVoiceConfig {
    /**
     * The voice name to use for speech synthesis.
     *
     * For a full list of names and demos of what each voice sounds like, see {@link https://cloud.google.com/text-to-speech/docs/chirp3-hd | Chirp 3: HD Voices}.
     */
    voiceName?: string;
}

/**
 * If the prompt was blocked, this will be populated with `blockReason` and
 * the relevant `safetyRatings`.
 * @public
 */
export declare interface PromptFeedback {
    blockReason?: BlockReason;
    safetyRatings: SafetyRating[];
    /**
     * A human-readable description of the `blockReason`.
     *
     * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
     */
    blockReasonMessage?: string;
}

/**
 * Params passed to {@link getGenerativeModel}.
 * @public
 */
export declare interface RequestOptions {
    /**
     * Request timeout in milliseconds. Defaults to 180 seconds (180000ms).
     */
    timeout?: number;
    /**
     * Base url for endpoint. Defaults to
     * https://firebasevertexai.googleapis.com, which is the
     * {@link https://console.cloud.google.com/apis/library/firebasevertexai.googleapis.com?project=_ | Firebase AI Logic API}
     * (used regardless of your chosen Gemini API provider).
     */
    baseUrl?: string;
    /**
     * Limits amount of sequential function calls the SDK can make during automatic
     * function calling, in order to prevent infinite loops. If not specified,
     * this value defaults to 10.
     *
     * When it reaches this limit, it will return the last response received
     * from the model, whether it is a text response or further function calls.
     */
    maxSequentalFunctionCalls?: number;
}

/**
 * Generation modalities to be returned in generation responses.
 *
 * @beta
 */
export declare const ResponseModality: {
    /**
     * Text.
     * @beta
     */
    readonly TEXT: "TEXT";
    /**
     * Image.
     * @beta
     */
    readonly IMAGE: "IMAGE";
    /**
     * Audio.
     * @beta
     */
    readonly AUDIO: "AUDIO";
};

/**
 * Generation modalities to be returned in generation responses.
 *
 * @beta
 */
export declare type ResponseModality = (typeof ResponseModality)[keyof typeof ResponseModality];

/**
 * @public
 */
export declare interface RetrievedContextAttribution {
    uri: string;
    title: string;
}

/**
 * @license
 * Copyright 2024 Google LLC
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
/**
 * Role is the producer of the content.
 * @public
 */
export declare type Role = (typeof POSSIBLE_ROLES)[number];

/**
 * A safety rating associated with a {@link GenerateContentCandidate}
 * @public
 */
export declare interface SafetyRating {
    category: HarmCategory;
    probability: HarmProbability;
    /**
     * The harm severity level.
     *
     * This property is only supported when using the Vertex AI Gemini API ({@link VertexAIBackend}).
     * When using the Gemini Developer API ({@link GoogleAIBackend}), this property is not supported and will default to `HarmSeverity.UNSUPPORTED`.
     */
    severity: HarmSeverity;
    /**
     * The probability score of the harm category.
     *
     * This property is only supported when using the Vertex AI Gemini API ({@link VertexAIBackend}).
     * When using the Gemini Developer API ({@link GoogleAIBackend}), this property is not supported and will default to 0.
     */
    probabilityScore: number;
    /**
     * The severity score of the harm category.
     *
     * This property is only supported when using the Vertex AI Gemini API ({@link VertexAIBackend}).
     * When using the Gemini Developer API ({@link GoogleAIBackend}), this property is not supported and will default to 0.
     */
    severityScore: number;
    blocked: boolean;
}

/**
 * Safety setting that can be sent as part of request parameters.
 * @public
 */
export declare interface SafetySetting {
    category: HarmCategory;
    threshold: HarmBlockThreshold;
    /**
     * The harm block method.
     *
     * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
     * When using the Gemini Developer API ({@link GoogleAIBackend}), an {@link AIError} will be
     * thrown if this property is defined.
     */
    method?: HarmBlockMethod;
}

/**
 * Parent class encompassing all Schema types, with static methods that
 * allow building specific Schema types. This class can be converted with
 * `JSON.stringify()` into a JSON string accepted by Vertex AI REST endpoints.
 * (This string conversion is automatically done when calling SDK methods.)
 * @public
 */
export declare abstract class Schema implements SchemaInterface {
    /**
     * Optional. The type of the property.
     * This can only be undefined when using `anyOf` schemas, which do not have an
     * explicit type in the {@link https://swagger.io/docs/specification/v3_0/data-models/data-types/#any-type | OpenAPI specification}.
     */
    type?: SchemaType;
    /** Optional. The format of the property.
     * Supported formats:<br/>
     * <ul>
     *  <li>for NUMBER type: "float", "double"</li>
     *  <li>for INTEGER type: "int32", "int64"</li>
     *  <li>for STRING type: "email", "byte", etc</li>
     * </ul>
     */
    format?: string;
    /** Optional. The description of the property. */
    description?: string;
    /** Optional. The items of the property. */
    items?: SchemaInterface;
    /** The minimum number of items (elements) in a schema of {@link (SchemaType:type)} `array`. */
    minItems?: number;
    /** The maximum number of items (elements) in a schema of {@link (SchemaType:type)} `array`. */
    maxItems?: number;
    /** Optional. Whether the property is nullable. Defaults to false. */
    nullable: boolean;
    /** Optional. The example of the property. */
    example?: unknown;
    /**
     * Allows user to add other schema properties that have not yet
     * been officially added to the SDK.
     */
    [key: string]: unknown;
    constructor(schemaParams: SchemaInterface);
    /* Excluded from this release type: toJSON */
    static array(arrayParams: SchemaParams & {
        items: Schema;
    }): ArraySchema;
    static object(objectParams: SchemaParams & {
        properties: {
            [k: string]: Schema;
        };
        optionalProperties?: string[];
    }): ObjectSchema;
    static string(stringParams?: SchemaParams): StringSchema;
    static enumString(stringParams: SchemaParams & {
        enum: string[];
    }): StringSchema;
    static integer(integerParams?: SchemaParams): IntegerSchema;
    static number(numberParams?: SchemaParams): NumberSchema;
    static boolean(booleanParams?: SchemaParams): BooleanSchema;
    static anyOf(anyOfParams: SchemaParams & {
        anyOf: TypedSchema[];
    }): AnyOfSchema;
}

/**
 * Interface for {@link Schema} class.
 * @public
 */
export declare interface SchemaInterface extends SchemaShared<SchemaInterface> {
    /**
     * The type of the property. this can only be undefined when using `anyof` schemas,
     * which do not have an explicit type in the {@link https://swagger.io/docs/specification/v3_0/data-models/data-types/#any-type | OpenAPI Specification}.
     */
    type?: SchemaType;
}

/**
 * Params passed to {@link Schema} static methods to create specific
 * {@link Schema} classes.
 * @public
 */
export declare interface SchemaParams extends SchemaShared<SchemaInterface> {
}

/**
 * Final format for {@link Schema} params passed to backend requests.
 * @public
 */
export declare interface SchemaRequest extends SchemaShared<SchemaRequest> {
    /**
     * The type of the property. this can only be undefined when using `anyOf` schemas,
     * which do not have an explicit type in the {@link https://swagger.io/docs/specification/v3_0/data-models/data-types/#any-type | OpenAPI specification }.
     */
    type?: SchemaType;
    /** Optional. Array of required property. */
    required?: string[];
}

/**
 * Basic {@link Schema} properties shared across several Schema-related
 * types.
 * @public
 */
export declare interface SchemaShared<T> {
    /**
     * An array of {@link Schema}. The generated data must be valid against any of the schemas
     * listed in this array. This allows specifying multiple possible structures or types for a
     * single field.
     */
    anyOf?: T[];
    /** Optional. The format of the property.
     * When using the Gemini Developer API ({@link GoogleAIBackend}), this must be either `'enum'` or
     * `'date-time'`, otherwise requests will fail.
     */
    format?: string;
    /** Optional. The description of the property. */
    description?: string;
    /**
     * The title of the property. This helps document the schema's purpose but does not typically
     * constrain the generated value. It can subtly guide the model by clarifying the intent of a
     * field.
     */
    title?: string;
    /** Optional. The items of the property. */
    items?: T;
    /** The minimum number of items (elements) in a schema of {@link (SchemaType:type)} `array`. */
    minItems?: number;
    /** The maximum number of items (elements) in a schema of {@link (SchemaType:type)} `array`. */
    maxItems?: number;
    /** Optional. Map of `Schema` objects. */
    properties?: {
        [k: string]: T;
    };
    /** A hint suggesting the order in which the keys should appear in the generated JSON string. */
    propertyOrdering?: string[];
    /** Optional. The enum of the property. */
    enum?: string[];
    /** Optional. The example of the property. */
    example?: unknown;
    /** Optional. Whether the property is nullable. */
    nullable?: boolean;
    /** The minimum value of a numeric type. */
    minimum?: number;
    /** The maximum value of a numeric type. */
    maximum?: number;
    [key: string]: unknown;
}

/**
 * Contains the list of OpenAPI data types
 * as defined by the
 * {@link https://swagger.io/docs/specification/data-models/data-types/ | OpenAPI specification}
 * @public
 */
export declare const SchemaType: {
    /** String type. */
    readonly STRING: "string";
    /** Number type. */
    readonly NUMBER: "number";
    /** Integer type. */
    readonly INTEGER: "integer";
    /** Boolean type. */
    readonly BOOLEAN: "boolean";
    /** Array type. */
    readonly ARRAY: "array";
    /** Object type. */
    readonly OBJECT: "object";
};

/**
 * Contains the list of OpenAPI data types
 * as defined by the
 * {@link https://swagger.io/docs/specification/data-models/data-types/ | OpenAPI specification}
 * @public
 */
export declare type SchemaType = (typeof SchemaType)[keyof typeof SchemaType];

/**
 * Google search entry point.
 *
 * @public
 */
export declare interface SearchEntrypoint {
    /**
     * HTML/CSS snippet that must be embedded in a web page. The snippet is designed to avoid
     * undesired interaction with the rest of the page's CSS.
     *
     * To ensure proper rendering and prevent CSS conflicts, it is recommended
     * to encapsulate this `renderedContent` within a shadow DOM when embedding it
     * into a webpage. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM | MDN: Using shadow DOM}.
     *
     * @example
     * ```javascript
     * const container = document.createElement('div');
     * document.body.appendChild(container);
     * container.attachShadow({ mode: 'open' }).innerHTML = renderedContent;
     * ```
     */
    renderedContent?: string;
}

/**
 * Represents a specific segment within a {@link Content} object, often used to
 * pinpoint the exact location of text or data that grounding information refers to.
 *
 * @public
 */
export declare interface Segment {
    /**
     * The zero-based index of the {@link Part} object within the `parts` array
     * of its parent {@link Content} object. This identifies which part of the
     * content the segment belongs to.
     */
    partIndex: number;
    /**
     * The zero-based start index of the segment within the specified `Part`,
     * measured in UTF-8 bytes. This offset is inclusive, starting from 0 at the
     * beginning of the part's content (e.g., `Part.text`).
     */
    startIndex: number;
    /**
     * The zero-based end index of the segment within the specified `Part`,
     * measured in UTF-8 bytes. This offset is exclusive, meaning the character
     * at this index is not included in the segment.
     */
    endIndex: number;
    /**
     * The text corresponding to the segment from the response.
     */
    text: string;
}

/**
 * Options that can be provided per-request.
 * Extends the base {@link RequestOptions} (like `timeout` and `baseUrl`)
 * with request-specific controls like cancellation via `AbortSignal`.
 *
 * Options specified here will override any default {@link RequestOptions}
 * configured on a model (for example, {@link GenerativeModel}).
 *
 * @public
 */
export declare interface SingleRequestOptions extends RequestOptions {
    /**
     * An `AbortSignal` instance that allows cancelling ongoing requests (like `generateContent` or
     * `generateImages`).
     *
     * If provided, calling `abort()` on the corresponding `AbortController`
     * will attempt to cancel the underlying HTTP request. An `AbortError` will be thrown
     * if cancellation is successful.
     *
     * Note that this will not cancel the request in the backend, so any applicable billing charges
     * will still be applied despite cancellation.
     *
     * @example
     * ```javascript
     * const controller = new AbortController();
     * const model = getGenerativeModel({
     *   // ...
     * });
     * model.generateContent(
     *   "Write a story about a magic backpack.",
     *   { signal: controller.signal }
     * );
     *
     * // To cancel request:
     * controller.abort();
     * ```
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
     */
    signal?: AbortSignal;
}

/**
 * Configures speech synthesis.
 *
 * @beta
 */
export declare interface SpeechConfig {
    /**
     * Configures the voice to be used in speech synthesis.
     */
    voiceConfig?: VoiceConfig;
}

/**
 * Starts a real-time, bidirectional audio conversation with the model. This helper function manages
 * the complexities of microphone access, audio recording, playback, and interruptions.
 *
 * @remarks Important: This function must be called in response to a user gesture
 * (for example, a button click) to comply with {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices#autoplay_policy | browser autoplay policies}.
 *
 * @example
 * ```javascript
 * const liveSession = await model.connect();
 * let conversationController;
 *
 * // This function must be called from within a click handler.
 * async function startConversation() {
 *   try {
 *     conversationController = await startAudioConversation(liveSession);
 *   } catch (e) {
 *     // Handle AI-specific errors
 *     if (e instanceof AIError) {
 *       console.error("AI Error:", e.message);
 *     }
 *     // Handle microphone permission and hardware errors
 *     else if (e instanceof DOMException) {
 *       console.error("Microphone Error:", e.message);
 *     }
 *     // Handle other unexpected errors
 *     else {
 *       console.error("An unexpected error occurred:", e);
 *     }
 *   }
 * }
 *
 * // Later, to stop the conversation:
 * // if (conversationController) {
 * //   await conversationController.stop();
 * // }
 * ```
 *
 * @param liveSession - An active {@link LiveSession} instance.
 * @param options - Configuration options for the audio conversation.
 * @returns A `Promise` that resolves with an {@link AudioConversationController}.
 * @throws `AIError` if the environment does not support required Web APIs (`UNSUPPORTED`), if a conversation is already active (`REQUEST_ERROR`), the session is closed (`SESSION_CLOSED`), or if an unexpected initialization error occurs (`ERROR`).
 * @throws `DOMException` Thrown by `navigator.mediaDevices.getUserMedia()` if issues occur with microphone access, such as permissions being denied (`NotAllowedError`) or no compatible hardware being found (`NotFoundError`). See the {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions | MDN documentation} for a full list of exceptions.
 *
 * @beta
 */
export declare function startAudioConversation(liveSession: LiveSession, options?: StartAudioConversationOptions): Promise<AudioConversationController>;

/**
 * Options for {@link startAudioConversation}.
 *
 * @beta
 */
export declare interface StartAudioConversationOptions {
    /**
     * An async handler that is called when the model requests a function to be executed.
     * The handler should perform the function call and return the result as a `Part`,
     * which will then be sent back to the model.
     */
    functionCallingHandler?: (functionCalls: FunctionCall[]) => Promise<FunctionResponse>;
}

/**
 * Params for {@link GenerativeModel.startChat}.
 * @public
 */
export declare interface StartChatParams extends BaseParams {
    history?: Content[];
    tools?: Tool[];
    toolConfig?: ToolConfig;
    systemInstruction?: string | Part | Content;
}

/**
 * Schema class for "string" types. Can be used with or without
 * enum values.
 * @public
 */
export declare class StringSchema extends Schema {
    enum?: string[];
    constructor(schemaParams?: SchemaParams, enumValues?: string[]);
    /* Excluded from this release type: toJSON */
}

/**
 * {@link GenerativeModel} APIs that execute on a server-side template.
 *
 * This class should only be instantiated with {@link getTemplateGenerativeModel}.
 *
 * @beta
 */
export declare class TemplateGenerativeModel {
    /* Excluded from this release type: _apiSettings */
    /**
     * Additional options to use when making requests.
     */
    requestOptions?: RequestOptions;
    /**
     * @hideconstructor
     */
    constructor(ai: AI, requestOptions?: RequestOptions);
    /**
     * Makes a single non-streaming call to the model and returns an object
     * containing a single {@link GenerateContentResponse}.
     *
     * @param templateId - The ID of the server-side template to execute.
     * @param templateVariables - A key-value map of variables to populate the
     * template with.
     *
     * @beta
     */
    generateContent(templateId: string, templateVariables: object, singleRequestOptions?: SingleRequestOptions): Promise<GenerateContentResult>;
    /**
     * Makes a single streaming call to the model and returns an object
     * containing an iterable stream that iterates over all chunks in the
     * streaming response as well as a promise that returns the final aggregated
     * response.
     *
     * @param templateId - The ID of the server-side template to execute.
     * @param templateVariables - A key-value map of variables to populate the
     * template with.
     *
     * @beta
     */
    generateContentStream(templateId: string, templateVariables: object, singleRequestOptions?: SingleRequestOptions): Promise<GenerateContentStreamResult>;
}

/**
 * Class for Imagen model APIs that execute on a server-side template.
 *
 * This class should only be instantiated with {@link getTemplateImagenModel}.
 *
 * @beta
 */
export declare class TemplateImagenModel {
    /* Excluded from this release type: _apiSettings */
    /**
     * Additional options to use when making requests.
     */
    requestOptions?: RequestOptions;
    /**
     * @hideconstructor
     */
    constructor(ai: AI, requestOptions?: RequestOptions);
    /**
     * Makes a single call to the model and returns an object containing a single
     * {@link ImagenGenerationResponse}.
     *
     * @param templateId - The ID of the server-side template to execute.
     * @param templateVariables - A key-value map of variables to populate the
     * template with.
     *
     * @beta
     */
    generateImages(templateId: string, templateVariables: object, singleRequestOptions?: SingleRequestOptions): Promise<ImagenGenerationResponse<ImagenInlineImage>>;
}

/**
 * Content part interface if the part represents a text string.
 * @public
 */
export declare interface TextPart {
    text: string;
    inlineData?: never;
    functionCall?: never;
    functionResponse?: never;
    thought?: boolean;
    /* Excluded from this release type: thoughtSignature */
    executableCode?: never;
    codeExecutionResult?: never;
}

/**
 * Configuration for "thinking" behavior of compatible Gemini models.
 *
 * Certain models utilize a thinking process before generating a response. This allows them to
 * reason through complex problems and plan a more coherent and accurate answer.
 *
 * @public
 */
export declare interface ThinkingConfig {
    /**
     * The thinking budget, in tokens.
     *
     * @remarks
     * This parameter sets an upper limit on the number of tokens the model can use for its internal
     * "thinking" process. A higher budget may result in higher quality responses for complex tasks
     * but can also increase latency and cost.
     *
     * The range of supported thinking budget values depends on the model.
     *
     * <ul>
     * <li>To use the default thinking budget for a model, leave
     * this value undefined.</li>
     *
     * <li>To disable thinking, when supported by the model, set this value
     * to `0`.</li>
     *
     * <li>To use dynamic thinking, which allows the model to decide on the thinking
     * budget based on the task, set this value to `-1`.</li>
     * </ul>
     *
     * An error will be thrown if you set a thinking budget for a model that does not support this
     * feature or if the specified budget is not within the model's supported range.
     *
     * The model will also error if `thinkingLevel` and `thinkingBudget` are
     * both set.
     */
    thinkingBudget?: number;
    /**
     * If not specified, Gemini will use the model's default dynamic thinking level.
     *
     * @remarks
     * Note: The model will error if `thinkingLevel` and `thinkingBudget` are
     * both set.
     *
     * Important: Gemini 2.5 series models do not support thinking levels; use
     * `thinkingBudget` to set a thinking budget instead.
     */
    thinkingLevel?: ThinkingLevel;
    /**
     * Whether to include "thought summaries" in the model's response.
     *
     * @remarks
     * Thought summaries provide a brief overview of the model's internal thinking process,
     * offering insight into how it arrived at the final answer. This can be useful for
     * debugging, understanding the model's reasoning, and verifying its accuracy.
     */
    includeThoughts?: boolean;
}

/**
 * A preset that controls the model's "thinking" process. Use
 * `ThinkingLevel.LOW` for faster responses on less complex tasks, and
 * `ThinkingLevel.HIGH` for better reasoning on more complex tasks.
 *
 * @public
 */
export declare const ThinkingLevel: {
    MINIMAL: string;
    LOW: string;
    MEDIUM: string;
    HIGH: string;
};

/**
 * A preset that controls the model's "thinking" process. Use
 * `ThinkingLevel.LOW` for faster responses on less complex tasks, and
 * `ThinkingLevel.HIGH` for better reasoning on more complex tasks.
 *
 * @public
 */
export declare type ThinkingLevel = (typeof ThinkingLevel)[keyof typeof ThinkingLevel];

/**
 * Defines a tool that model can call to access external knowledge.
 * @public
 */
export declare type Tool = FunctionDeclarationsTool | GoogleSearchTool | CodeExecutionTool | URLContextTool;

/**
 * Tool config. This config is shared for all tools provided in the request.
 * @public
 */
export declare interface ToolConfig {
    functionCallingConfig?: FunctionCallingConfig;
}

/**
 * Transcription of audio. This can be returned from a {@link LiveGenerativeModel} if transcription
 * is enabled with the `inputAudioTranscription` or `outputAudioTranscription` properties on
 * the {@link LiveGenerationConfig}.
 *
 * @beta
 */
export declare interface Transcription {
    /**
     * The text transcription of the audio.
     */
    text?: string;
}

/**
 * A type that includes all specific Schema types.
 * @public
 */
export declare type TypedSchema = IntegerSchema | NumberSchema | StringSchema | BooleanSchema | ObjectSchema | ArraySchema | AnyOfSchema;

/**
 * Specifies the URL Context configuration.
 *
 * @beta
 */
export declare interface URLContext {
}

/**
 * Metadata related to {@link URLContextTool}.
 *
 * @public
 */
export declare interface URLContextMetadata {
    /**
     * List of URL metadata used to provide context to the Gemini model.
     */
    urlMetadata: URLMetadata[];
}

/**
 * A tool that allows you to provide additional context to the models in the form of public web
 * URLs. By including URLs in your request, the Gemini model will access the content from those
 * pages to inform and enhance its response.
 *
 * @beta
 */
export declare interface URLContextTool {
    /**
     * Specifies the URL Context configuration.
     */
    urlContext: URLContext;
}

/**
 * Metadata for a single URL retrieved by the {@link URLContextTool} tool.
 *
 * @public
 */
export declare interface URLMetadata {
    /**
     * The retrieved URL.
     */
    retrievedUrl?: string;
    /**
     * The status of the URL retrieval.
     */
    urlRetrievalStatus?: URLRetrievalStatus;
}

/**
 * The status of a URL retrieval.
 *
 * @remarks
 * <b>URL_RETRIEVAL_STATUS_UNSPECIFIED:</b> Unspecified retrieval status.
 * <br/>
 * <b>URL_RETRIEVAL_STATUS_SUCCESS:</b> The URL retrieval was successful.
 * <br/>
 * <b>URL_RETRIEVAL_STATUS_ERROR:</b> The URL retrieval failed.
 * <br/>
 * <b>URL_RETRIEVAL_STATUS_PAYWALL:</b> The URL retrieval failed because the content is behind a paywall.
 * <br/>
 * <b>URL_RETRIEVAL_STATUS_UNSAFE:</b> The URL retrieval failed because the content is unsafe.
 * <br/>
 *
 * @public
 */
export declare const URLRetrievalStatus: {
    /**
     * Unspecified retrieval status.
     */
    URL_RETRIEVAL_STATUS_UNSPECIFIED: string;
    /**
     * The URL retrieval was successful.
     */
    URL_RETRIEVAL_STATUS_SUCCESS: string;
    /**
     * The URL retrieval failed.
     */
    URL_RETRIEVAL_STATUS_ERROR: string;
    /**
     * The URL retrieval failed because the content is behind a paywall.
     */
    URL_RETRIEVAL_STATUS_PAYWALL: string;
    /**
     * The URL retrieval failed because the content is unsafe.
     */
    URL_RETRIEVAL_STATUS_UNSAFE: string;
};

/**
 * The status of a URL retrieval.
 *
 * @remarks
 * <b>URL_RETRIEVAL_STATUS_UNSPECIFIED:</b> Unspecified retrieval status.
 * <br/>
 * <b>URL_RETRIEVAL_STATUS_SUCCESS:</b> The URL retrieval was successful.
 * <br/>
 * <b>URL_RETRIEVAL_STATUS_ERROR:</b> The URL retrieval failed.
 * <br/>
 * <b>URL_RETRIEVAL_STATUS_PAYWALL:</b> The URL retrieval failed because the content is behind a paywall.
 * <br/>
 * <b>URL_RETRIEVAL_STATUS_UNSAFE:</b> The URL retrieval failed because the content is unsafe.
 * <br/>
 *
 * @public
 */
export declare type URLRetrievalStatus = (typeof URLRetrievalStatus)[keyof typeof URLRetrievalStatus];

/**
 * Usage metadata about a {@link GenerateContentResponse}.
 *
 * @public
 */
export declare interface UsageMetadata {
    promptTokenCount: number;
    candidatesTokenCount: number;
    /**
     * The number of tokens used by the model's internal "thinking" process.
     */
    thoughtsTokenCount?: number;
    totalTokenCount: number;
    /**
     * The number of tokens used by tools.
     */
    toolUsePromptTokenCount?: number;
    promptTokensDetails?: ModalityTokenCount[];
    candidatesTokensDetails?: ModalityTokenCount[];
    /**
     * A list of tokens used by tools, broken down by modality.
     */
    toolUsePromptTokensDetails?: ModalityTokenCount[];
    /**
     * The number of tokens in the prompt that were served from the cache.
     * If implicit caching is not active or no content was cached,
     * this will be 0.
     */
    cachedContentTokenCount?: number;
    /**
     * Detailed breakdown of the cached tokens by modality (for example, text or
     * image). This list provides granular insight into which parts of
     * the content were cached.
     */
    cacheTokensDetails?: ModalityTokenCount[];
}

/**
 * Configuration class for the Vertex AI Gemini API.
 *
 * Use this with {@link AIOptions} when initializing the AI service via
 * {@link getAI | getAI()} to specify the Vertex AI Gemini API as the backend.
 *
 * @public
 */
export declare class VertexAIBackend extends Backend {
    /**
     * The region identifier.
     * See {@link https://firebase.google.com/docs/vertex-ai/locations#available-locations | Vertex AI locations}
     * for a list of supported locations.
     */
    readonly location: string;
    /**
     * Creates a configuration object for the Vertex AI backend.
     *
     * @param location - The region identifier, defaulting to `us-central1`;
     * see {@link https://firebase.google.com/docs/vertex-ai/locations#available-locations | Vertex AI locations}
     * for a list of supported locations.
     */
    constructor(location?: string);
    /* Excluded from this release type: _getModelPath */
    /* Excluded from this release type: _getTemplatePath */
}

/**
 * Describes the input video content.
 * @public
 */
export declare interface VideoMetadata {
    /**
     * The start offset of the video in
     * protobuf {@link https://cloud.google.com/ruby/docs/reference/google-cloud-workflows-v1/latest/Google-Protobuf-Duration#json-mapping | Duration} format.
     */
    startOffset: string;
    /**
     * The end offset of the video in
     * protobuf {@link https://cloud.google.com/ruby/docs/reference/google-cloud-workflows-v1/latest/Google-Protobuf-Duration#json-mapping | Duration} format.
     */
    endOffset: string;
}

/**
 * Configuration for the voice to used in speech synthesis.
 *
 * @beta
 */
export declare interface VoiceConfig {
    /**
     * Configures the voice using a pre-built voice configuration.
     */
    prebuiltVoiceConfig?: PrebuiltVoiceConfig;
}

/**
 * @public
 */
export declare interface WebAttribution {
    uri: string;
    title: string;
}

/**
 * A grounding chunk from the web.
 *
 * Important: If using Grounding with Google Search, you are required to comply with the
 * {@link https://cloud.google.com/terms/service-terms | Service Specific Terms} for "Grounding with Google Search".
 *
 * @public
 */
export declare interface WebGroundingChunk {
    /**
     * The URI of the retrieved web page.
     */
    uri?: string;
    /**
     * The title of the retrieved web page.
     */
    title?: string;
    /**
     * The domain of the original URI from which the content was retrieved.
     *
     * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
     * When using the Gemini Developer API ({@link GoogleAIBackend}), this property will be
     * `undefined`.
     */
    domain?: string;
}

/* Excluded from this release type: WebSocketHandler */

export { }

