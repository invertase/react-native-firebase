import { describe, expect, it } from '@jest/globals';
import {
  // Runtime values (classes, functions, constants)
  BackendType,
  POSSIBLE_ROLES,
  AIError,
  GenerativeModel,
  AIModel,
  getAI,
  getGenerativeModel,
  ChatSession,
  GoogleAIBackend,
  VertexAIBackend,
  // Types that exist - imported for type checking
  Part,
  ResponseModality,
  Role,
  Tool,
  TypedSchema,
  AI,
  AIOptions,
  BaseParams,
  Citation,
  CitationMetadata,
  Content,
  CountTokensRequest,
  CountTokensResponse,
  CustomErrorData,
  EnhancedGenerateContentResponse,
  ErrorDetails,
  FileData,
  FileDataPart,
  FunctionCall,
  FunctionCallingConfig,
  FunctionCallPart,
  FunctionDeclaration,
  FunctionDeclarationsTool,
  FunctionResponse,
  FunctionResponsePart,
  GenerateContentCandidate,
  GenerateContentRequest,
  GenerateContentResponse,
  GenerateContentResult,
  GenerateContentStreamResult,
  GenerationConfig,
  GenerativeContentBlob,
  GroundingAttribution,
  GroundingMetadata,
  InlineDataPart,
  ModalityTokenCount,
  ModelParams,
  ObjectSchemaInterface,
  PromptFeedback,
  RequestOptions,
  RetrievedContextAttribution,
  SafetyRating,
  SafetySetting,
  SchemaInterface,
  SchemaParams,
  SchemaRequest,
  SchemaShared,
  Segment,
  StartChatParams,
  TextPart,
  ToolConfig,
  UsageMetadata,
  VideoMetadata,
  WebAttribution,
  // Enums
  AIErrorCode,
  BlockReason,
  FinishReason,
  FunctionCallingMode,
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory,
  HarmProbability,
  HarmSeverity,
  Modality,
  SchemaType,
} from '../lib';

describe('AI', function () {
  describe('modular', function () {
    // Runtime value exports (constants, classes, functions)
    it('`BackendType` constant is properly exposed to end user', function () {
      expect(BackendType).toBeDefined();
      expect(BackendType.VERTEX_AI).toBeDefined();
      expect(BackendType.GOOGLE_AI).toBeDefined();
    });

    it('`POSSIBLE_ROLES` constant is properly exposed to end user', function () {
      expect(POSSIBLE_ROLES).toBeDefined();
    });

    it('`AIError` class is properly exposed to end user', function () {
      expect(AIError).toBeDefined();
    });

    it('`GenerativeModel` class is properly exposed to end user', function () {
      expect(GenerativeModel).toBeDefined();
    });

    it('`AIModel` class is properly exposed to end user', function () {
      expect(AIModel).toBeDefined();
    });

    it('`getAI` function is properly exposed to end user', function () {
      expect(getAI).toBeDefined();
    });

    it('`getGenerativeModel` function is properly exposed to end user', function () {
      expect(getGenerativeModel).toBeDefined();
    });

    it('`ChatSession` class is properly exposed to end user', function () {
      expect(ChatSession).toBeDefined();
    });

    it('`GoogleAIBackend` class is properly exposed to end user', function () {
      expect(GoogleAIBackend).toBeDefined();
    });

    it('`VertexAIBackend` class is properly exposed to end user', function () {
      expect(VertexAIBackend).toBeDefined();
    });

    // Type exports - test that they can be used as types
    it('`Part` type is properly exposed to end user', function () {
      const _typeCheck: Part = { text: 'test' };
      expect(typeof _typeCheck).toBe('object');
    });

    it('`ResponseModality` type is properly exposed to end user', function () {
      const _typeCheck: ResponseModality = {} as ResponseModality;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`Role` type is properly exposed to end user', function () {
      const _typeCheck: Role = 'user';
      expect(typeof _typeCheck).toBe('string');
    });

    it('`Tool` type is properly exposed to end user', function () {
      const _typeCheck: Tool = {} as Tool;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`TypedSchema` type is properly exposed to end user', function () {
      const _typeCheck: TypedSchema = {} as TypedSchema;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`AI` type is properly exposed to end user', function () {
      const _typeCheck: AI = {} as AI;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`AIOptions` type is properly exposed to end user', function () {
      const _typeCheck: AIOptions = {} as AIOptions;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`BaseParams` type is properly exposed to end user', function () {
      const _typeCheck: BaseParams = {} as BaseParams;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`Citation` type is properly exposed to end user', function () {
      const _typeCheck: Citation = {} as Citation;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`CitationMetadata` type is properly exposed to end user', function () {
      const _typeCheck: CitationMetadata = {} as CitationMetadata;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`Content` type is properly exposed to end user', function () {
      const _typeCheck: Content = {} as Content;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`CountTokensRequest` type is properly exposed to end user', function () {
      const _typeCheck: CountTokensRequest = {} as CountTokensRequest;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`CountTokensResponse` type is properly exposed to end user', function () {
      const _typeCheck: CountTokensResponse = {} as CountTokensResponse;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`CustomErrorData` type is properly exposed to end user', function () {
      const _typeCheck: CustomErrorData = {} as CustomErrorData;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`EnhancedGenerateContentResponse` type is properly exposed to end user', function () {
      const _typeCheck: EnhancedGenerateContentResponse = {} as EnhancedGenerateContentResponse;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`ErrorDetails` type is properly exposed to end user', function () {
      const _typeCheck: ErrorDetails = {} as ErrorDetails;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FileData` type is properly exposed to end user', function () {
      const _typeCheck: FileData = {} as FileData;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FileDataPart` type is properly exposed to end user', function () {
      const _typeCheck: FileDataPart = {} as FileDataPart;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FunctionCall` type is properly exposed to end user', function () {
      const _typeCheck: FunctionCall = {} as FunctionCall;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FunctionCallingConfig` type is properly exposed to end user', function () {
      const _typeCheck: FunctionCallingConfig = {} as FunctionCallingConfig;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FunctionCallPart` type is properly exposed to end user', function () {
      const _typeCheck: FunctionCallPart = {} as FunctionCallPart;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FunctionDeclaration` type is properly exposed to end user', function () {
      const _typeCheck: FunctionDeclaration = {} as FunctionDeclaration;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FunctionDeclarationsTool` type is properly exposed to end user', function () {
      const _typeCheck: FunctionDeclarationsTool = {} as FunctionDeclarationsTool;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FunctionResponse` type is properly exposed to end user', function () {
      const _typeCheck: FunctionResponse = {} as FunctionResponse;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`FunctionResponsePart` type is properly exposed to end user', function () {
      const _typeCheck: FunctionResponsePart = {} as FunctionResponsePart;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GenerateContentCandidate` type is properly exposed to end user', function () {
      const _typeCheck: GenerateContentCandidate = {} as GenerateContentCandidate;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GenerateContentRequest` type is properly exposed to end user', function () {
      const _typeCheck: GenerateContentRequest = {} as GenerateContentRequest;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GenerateContentResponse` type is properly exposed to end user', function () {
      const _typeCheck: GenerateContentResponse = {} as GenerateContentResponse;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GenerateContentResult` type is properly exposed to end user', function () {
      const _typeCheck: GenerateContentResult = {} as GenerateContentResult;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GenerateContentStreamResult` type is properly exposed to end user', function () {
      const _typeCheck: GenerateContentStreamResult = {} as GenerateContentStreamResult;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GenerationConfig` type is properly exposed to end user', function () {
      const _typeCheck: GenerationConfig = {} as GenerationConfig;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GenerativeContentBlob` type is properly exposed to end user', function () {
      const _typeCheck: GenerativeContentBlob = {} as GenerativeContentBlob;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GroundingAttribution` type is properly exposed to end user', function () {
      const _typeCheck: GroundingAttribution = {} as GroundingAttribution;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`GroundingMetadata` type is properly exposed to end user', function () {
      const _typeCheck: GroundingMetadata = {} as GroundingMetadata;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`InlineDataPart` type is properly exposed to end user', function () {
      const _typeCheck: InlineDataPart = {} as InlineDataPart;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`ModalityTokenCount` type is properly exposed to end user', function () {
      const _typeCheck: ModalityTokenCount = {} as ModalityTokenCount;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`ModelParams` type is properly exposed to end user', function () {
      const _typeCheck: ModelParams = {} as ModelParams;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`ObjectSchemaInterface` type is properly exposed to end user', function () {
      const _typeCheck: ObjectSchemaInterface = {} as ObjectSchemaInterface;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`PromptFeedback` type is properly exposed to end user', function () {
      const _typeCheck: PromptFeedback = {} as PromptFeedback;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`RequestOptions` type is properly exposed to end user', function () {
      const _typeCheck: RequestOptions = {} as RequestOptions;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`RetrievedContextAttribution` type is properly exposed to end user', function () {
      const _typeCheck: RetrievedContextAttribution = {} as RetrievedContextAttribution;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`SafetyRating` type is properly exposed to end user', function () {
      const _typeCheck: SafetyRating = {} as SafetyRating;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`SafetySetting` type is properly exposed to end user', function () {
      const _typeCheck: SafetySetting = {} as SafetySetting;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`SchemaInterface` type is properly exposed to end user', function () {
      const _typeCheck: SchemaInterface = {} as SchemaInterface;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`SchemaParams` type is properly exposed to end user', function () {
      const _typeCheck: SchemaParams = {} as SchemaParams;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`SchemaRequest` type is properly exposed to end user', function () {
      const _typeCheck: SchemaRequest = {} as SchemaRequest;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`SchemaShared` type is properly exposed to end user', function () {
      const _typeCheck: SchemaShared<any> = {} as SchemaShared<any>;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`Segment` type is properly exposed to end user', function () {
      const _typeCheck: Segment = {} as Segment;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`StartChatParams` type is properly exposed to end user', function () {
      const _typeCheck: StartChatParams = {} as StartChatParams;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`TextPart` type is properly exposed to end user', function () {
      const _typeCheck: TextPart = {} as TextPart;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`ToolConfig` type is properly exposed to end user', function () {
      const _typeCheck: ToolConfig = {} as ToolConfig;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`UsageMetadata` type is properly exposed to end user', function () {
      const _typeCheck: UsageMetadata = {} as UsageMetadata;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`VideoMetadata` type is properly exposed to end user', function () {
      const _typeCheck: VideoMetadata = {} as VideoMetadata;
      expect(typeof _typeCheck).toBeDefined();
    });

    it('`WebAttribution` type is properly exposed to end user', function () {
      const _typeCheck: WebAttribution = {} as WebAttribution;
      expect(typeof _typeCheck).toBeDefined();
    });

    // Enum exports - test as values since enums are runtime objects
    it('`AIErrorCode` enum is properly exposed to end user', function () {
      // Const enum - test by accessing a property
      expect(AIErrorCode.NO_MODEL).toBeDefined();
    });

    it('`BlockReason` enum is properly exposed to end user', function () {
      expect(typeof BlockReason).toBe('object');
      expect(Object.keys(BlockReason).length).toBeGreaterThan(0);
    });

    it('`FinishReason` enum is properly exposed to end user', function () {
      expect(typeof FinishReason).toBe('object');
      expect(Object.keys(FinishReason).length).toBeGreaterThan(0);
    });

    it('`FunctionCallingMode` enum is properly exposed to end user', function () {
      expect(typeof FunctionCallingMode).toBe('object');
      expect(Object.keys(FunctionCallingMode).length).toBeGreaterThan(0);
    });

    it('`HarmBlockMethod` enum is properly exposed to end user', function () {
      expect(typeof HarmBlockMethod).toBe('object');
      expect(Object.keys(HarmBlockMethod).length).toBeGreaterThan(0);
    });

    it('`HarmBlockThreshold` enum is properly exposed to end user', function () {
      expect(typeof HarmBlockThreshold).toBe('object');
      expect(Object.keys(HarmBlockThreshold).length).toBeGreaterThan(0);
    });

    it('`HarmCategory` enum is properly exposed to end user', function () {
      expect(typeof HarmCategory).toBe('object');
      expect(Object.keys(HarmCategory).length).toBeGreaterThan(0);
    });

    it('`HarmProbability` enum is properly exposed to end user', function () {
      expect(typeof HarmProbability).toBe('object');
      expect(Object.keys(HarmProbability).length).toBeGreaterThan(0);
    });

    it('`HarmSeverity` enum is properly exposed to end user', function () {
      expect(typeof HarmSeverity).toBe('object');
      expect(Object.keys(HarmSeverity).length).toBeGreaterThan(0);
    });

    it('`Modality` enum is properly exposed to end user', function () {
      expect(typeof Modality).toBe('object');
      expect(Object.keys(Modality).length).toBeGreaterThan(0);
    });

    it('`SchemaType` enum is properly exposed to end user', function () {
      // Const enum - test by accessing a property
      expect(SchemaType.STRING).toBeDefined();
    });
  });
});
