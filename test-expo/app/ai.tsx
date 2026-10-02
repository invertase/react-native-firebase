import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  AIError,
  AIErrorCode,
  AgentPlatformBackend,
  BackendType,
  FunctionCallingMode,
  GoogleAIBackend,
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory,
  ImageConfigAspectRatio,
  ImageConfigImageSize,
  ResponseModality,
  Schema,
  ThinkingLevel,
  VertexAIBackend,
  getAI,
  getGenerativeModel,
  getLiveGenerativeModel,
  getTemplateGenerativeModel,
} from '@react-native-firebase/ai';
import {
  ReactNativeFirebaseAppCheckProvider,
  initializeAppCheck,
  type AppCheck,
} from '@react-native-firebase/app-check';
import { getAuth } from '@react-native-firebase/auth';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=';

// 324 zero bytes of 16-bit PCM audio (silence), base64 encoded.
const SILENT_PCM_BASE64 = 'A'.repeat(432);

// initializeAppCheck must only be called once per app; reuse across presses.
let appCheckInstance: AppCheck | undefined;

function getOrInitializeAppCheck(): AppCheck {
  if (!appCheckInstance) {
    const provider = new ReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: { provider: 'debug' },
      apple: { provider: 'debug' },
    });
    appCheckInstance = initializeAppCheck(getApp(), {
      provider,
      isTokenAutoRefreshEnabled: true,
    });
  }
  return appCheckInstance;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function AiScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ai = useMemo(() => getAI(getApp()), []);

  function showResult(message: string) {
    setError(null);
    setResult(message);
  }

  function showError(e: unknown) {
    setResult(null);
    setError(errorMessage(e));
  }

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    try {
      const value = await action();
      showResult(
        typeof value === 'string'
          ? value
          : `${label}: ok${value === undefined ? '' : ` → ${JSON.stringify(value)}`}`,
      );
    } catch (e) {
      showError(e);
    }
  }

  return (
    <ScreenChrome title="ai" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the AI Logic usage page. There is no AI emulator.
        Model calls need a configured Firebase project and network access.
      </Text>

      <Text style={styles.section}>Instance and backends</Text>
      <AppButton
        title="getAI"
        onPress={() =>
          run('getAI', () => {
            const instance = getAI();
            const sameDefaultApp = getAI(getApp());
            return {
              appName: instance.app.name,
              sameAsMemo: instance === ai,
              sameAsGetApp: sameDefaultApp.app.name === instance.app.name,
              backendType: instance.backend.backendType,
            };
          })
        }
      />
      <AppButton
        title="getAI auth + appCheck"
        onPress={() =>
          run('getAI auth + appCheck', () => {
            const app = getApp();
            const authInstance = getAuth(app);
            const check = getOrInitializeAppCheck();
            const instance = getAI(app, {
              appCheck: check,
              auth: authInstance,
              backend: new GoogleAIBackend(),
            });
            return {
              backendType: instance.backend.backendType,
              hasAuth: Boolean(authInstance),
              hasAppCheck: Boolean(check),
            };
          })
        }
      />
      <AppButton
        title="GoogleAIBackend"
        onPress={() =>
          run('GoogleAIBackend', () => {
            const backend = new GoogleAIBackend();
            const instance = getAI(getApp(), { backend });
            return { backendType: instance.backend.backendType };
          })
        }
      />
      <AppButton
        title="AgentPlatformBackend"
        onPress={() =>
          run('AgentPlatformBackend', () => {
            const backend = new AgentPlatformBackend('global');
            const instance = getAI(getApp(), { backend });
            return { backendType: instance.backend.backendType };
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: VertexAIBackend is deprecated. Prefer AgentPlatformBackend.
      </Text>
      <AppButton
        title="VertexAIBackend (deprecated)"
        onPress={() =>
          run('VertexAIBackend', () => {
            const backend = new VertexAIBackend('us-central1');
            const instance = getAI(getApp(), { backend });
            return { backendType: instance.backend.backendType };
          })
        }
      />
      <AppButton
        title="BackendType"
        onPress={() =>
          run('BackendType', () => ({
            GOOGLE_AI: BackendType.GOOGLE_AI,
            AGENT_PLATFORM: BackendType.AGENT_PLATFORM,
            VERTEX_AI: BackendType.VERTEX_AI,
          }))
        }
      />

      <Text style={styles.section}>Generative model</Text>
      <AppButton
        title="getGenerativeModel"
        onPress={() =>
          run('getGenerativeModel', () => {
            const model = getGenerativeModel(ai, { model: 'gemini-3.1-flash-lite' });
            return { model: model.model };
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: getGenerativeModel throws AIError (NO_MODEL) when modelParams.model is missing.
      </Text>
      <AppButton
        title="getGenerativeModel missing model (throws)"
        onPress={() =>
          run('getGenerativeModel missing model', () =>
            // @ts-expect-error intentional missing model for throw demo
            getGenerativeModel(ai, {}),
          )
        }
      />
      <AppButton
        title="Schema.object"
        onPress={() =>
          run('Schema.object', () => {
            const schema = Schema.object({
              properties: {
                name: Schema.string(),
                age: Schema.number(),
              },
              optionalProperties: ['age'],
            });
            return schema.toJSON();
          })
        }
      />
      <AppButton
        title="Schema helpers"
        onPress={() =>
          run('Schema helpers', () => ({
            array: Schema.array({ items: Schema.integer() }).toJSON(),
            enumString: Schema.enumString({ enum: ['red', 'green'] }).toJSON(),
            boolean: Schema.boolean().toJSON(),
            number: Schema.number().toJSON(),
            anyOf: Schema.anyOf({ anyOf: [Schema.string(), Schema.number()] }).toJSON(),
          }))
        }
      />
      <AppButton
        title="generateContent"
        onPress={() =>
          run('generateContent', async () => {
            const model = getGenerativeModel(ai, { model: 'gemini-3.1-flash-lite' });
            const response = await model.generateContent('hello from test-expo');
            return response.response.text();
          })
        }
      />
      <AppButton
        title="generateContentStream"
        onPress={() =>
          run('generateContentStream', async () => {
            const model = getGenerativeModel(ai, { model: 'gemini-3.1-flash-lite' });
            const streamResult = await model.generateContentStream('Write one short sentence.');
            let text = '';
            for await (const chunk of streamResult.stream) {
              text += chunk.text();
            }
            return text;
          })
        }
      />
      <AppButton
        title="multi-modal inlineData"
        onPress={() =>
          run('multi-modal inlineData', async () => {
            const model = getGenerativeModel(ai, { model: 'gemini-3.1-flash-lite' });
            const streamResult = await model.generateContentStream([
              'What can you see?',
              { inlineData: { mimeType: 'image/png', data: TINY_PNG_BASE64 } },
            ]);
            let text = '';
            for await (const chunk of streamResult.stream) {
              text += chunk.text();
            }
            return text;
          })
        }
      />
      <AppButton
        title="startChat / sendMessage"
        onPress={() =>
          run('startChat', async () => {
            const model = getGenerativeModel(ai, { model: 'gemini-3.1-flash-lite' });
            const chat = model.startChat();
            const response = await chat.sendMessage('Say hi in three words.');
            return response.response.text();
          })
        }
      />
      <AppButton
        title="sendMessageStream + getHistory"
        onPress={() =>
          run('sendMessageStream + getHistory', async () => {
            const model = getGenerativeModel(ai, { model: 'gemini-3.1-flash-lite' });
            const chat = model.startChat({
              history: [
                {
                  role: 'user',
                  parts: [{ text: 'Hello, I have 2 dogs in my house.' }],
                },
                {
                  role: 'model',
                  parts: [{ text: 'Great to meet you. What would you like to know?' }],
                },
              ],
              generationConfig: { maxOutputTokens: 100 },
            });
            const streamResult = await chat.sendMessageStream('How many paws are in my house?');
            let text = '';
            for await (const chunk of streamResult.stream) {
              text += chunk.text();
            }
            const history = await chat.getHistory();
            return { text, historyLength: history.length };
          })
        }
      />
      <AppButton
        title="functionDeclarations + functionResponse"
        onPress={() =>
          run('function calling', async () => {
            async function fetchWeather(args: unknown) {
              void args;
              return {
                temperature: 38,
                chancePrecipitation: '56%',
                cloudConditions: 'partlyCloudy',
              };
            }

            const fetchWeatherTool = {
              functionDeclarations: [
                {
                  name: 'fetchWeather',
                  description: 'Get the weather conditions for a specific city on a specific date',
                  parameters: Schema.object({
                    properties: {
                      location: Schema.object({
                        properties: {
                          city: Schema.string(),
                          state: Schema.string(),
                        },
                      }),
                      date: Schema.string(),
                    },
                  }),
                },
              ],
            };

            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              tools: [fetchWeatherTool],
            });
            const chat = model.startChat();
            let response = await chat.sendMessage(
              'What was the weather in Boston on October 17, 2024?',
            );
            const functionCalls = response.response.functionCalls();
            if (!functionCalls?.length) {
              return response.response.text();
            }
            const functionCall = functionCalls.find(call => call.name === 'fetchWeather');
            if (!functionCall) {
              return response.response.text();
            }
            const functionResult = await fetchWeather(functionCall.args);
            response = await chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: functionResult,
                },
              },
            ]);
            return response.response.text();
          })
        }
      />
      <AppButton
        title="FunctionCallingMode.ANY"
        onPress={() =>
          run('FunctionCallingMode.ANY', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              tools: [
                {
                  functionDeclarations: [
                    {
                      name: 'fetchWeather',
                      description: 'Get the weather conditions for a city',
                      parameters: Schema.object({
                        properties: { city: Schema.string({ description: 'The city name.' }) },
                      }),
                    },
                  ],
                },
              ],
              toolConfig: {
                functionCallingConfig: {
                  mode: FunctionCallingMode.ANY,
                  allowedFunctionNames: ['fetchWeather'],
                },
              },
            });
            const response = await model.generateContent('How is the weather in Boston?');
            return { functionCalls: response.response.functionCalls() ?? [] };
          })
        }
      />
      <AppButton
        title="functionReference (automatic function calling)"
        onPress={() =>
          run('functionReference', async () => {
            const model = getGenerativeModel(
              ai,
              {
                model: 'gemini-3.1-flash-lite',
                tools: [
                  {
                    functionDeclarations: [
                      {
                        name: 'fetchWeather',
                        description: 'Get the weather conditions for a city',
                        parameters: Schema.object({
                          properties: { city: Schema.string({ description: 'The city name.' }) },
                        }),
                        functionReference: async () => ({
                          temperature: 38,
                          cloudConditions: 'partlyCloudy',
                        }),
                      },
                    ],
                  },
                ],
              },
              { maxSequentialFunctionCalls: 5 },
            );
            const response = await model.generateContent('How is the weather in Boston?');
            return response.response.text();
          })
        }
      />
      <AppButton
        title="countTokens"
        onPress={() =>
          run('countTokens', async () => {
            const model = getGenerativeModel(ai, { model: 'gemini-3.1-flash-lite' });
            const count = await model.countTokens('Count these tokens for test-expo.');
            const generated = await model.generateContent('Write one short sentence.');
            return { count, usageMetadata: generated.response.usageMetadata };
          })
        }
      />
      <AppButton
        title="systemInstruction + generationConfig"
        onPress={() =>
          run('systemInstruction', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              systemInstruction: 'Answer in one short sentence.',
              generationConfig: { temperature: 0.2, maxOutputTokens: 64 },
            });
            const response = await model.generateContent('What is a thermos?');
            return response.response.text();
          })
        }
      />
      <AppButton
        title="safetySettings"
        onPress={() =>
          run('safetySettings', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              safetySettings: [
                {
                  category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
              ],
            });
            const response = await model.generateContent('Write a polite greeting.');
            return response.response.text();
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: SafetySetting.method with GoogleAIBackend throws when the request is mapped.
      </Text>
      <AppButton
        title="SafetySetting.method (throws on GoogleAI)"
        onPress={() =>
          run('SafetySetting.method', async () => {
            const googleAi = getAI(getApp(), { backend: new GoogleAIBackend() });
            const model = getGenerativeModel(googleAi, {
              model: 'gemini-3.1-flash-lite',
              safetySettings: [
                {
                  category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                  method: HarmBlockMethod.PROBABILITY,
                },
              ],
            });
            const response = await model.generateContent('Write a polite greeting.');
            return response.response.text();
          })
        }
      />
      <AppButton
        title="thinkingConfig"
        onPress={() =>
          run('thinkingConfig', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              generationConfig: {
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.LOW,
                  includeThoughts: true,
                },
              },
            });
            const response = await model.generateContent('What is 3 + 4?');
            return {
              thoughtSummary: response.response.thoughtSummary() ?? null,
              text: response.response.text(),
            };
          })
        }
      />
      <AppButton
        title="tools googleSearch"
        onPress={() =>
          run('googleSearch', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              tools: [{ googleSearch: {} }],
            });
            const response = await model.generateContent('Name one recent science headline.');
            const metadata = response.response.candidates?.[0]?.groundingMetadata;
            return {
              text: response.response.text(),
              suggestionsHtml: metadata?.searchEntryPoint?.renderedContent,
              sources: (metadata?.groundingChunks ?? []).map(chunk => chunk.web),
            };
          })
        }
      />
      <AppButton
        title="tools googleMaps"
        onPress={() =>
          run('googleMaps', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              tools: [{ googleMaps: {} }],
              toolConfig: {
                retrievalConfig: {
                  latLng: { latitude: 37.7749, longitude: -122.4194 },
                  languageCode: 'en-US',
                },
              },
            });
            const response = await model.generateContent('Name one coffee shop in San Francisco.');
            return response.response.text();
          })
        }
      />
      <AppButton
        title="tools urlContext"
        onPress={() =>
          run('urlContext', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              tools: [{ urlContext: {} }],
            });
            const response = await model.generateContent(
              'Summarize https://firebase.google.com/docs/ai-logic in one sentence.',
            );
            return response.response.text();
          })
        }
      />
      <AppButton
        title="tools codeExecution"
        onPress={() =>
          run('codeExecution', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-lite',
              tools: [{ codeExecution: {} }],
            });
            const response = await model.generateContent('What is 21 * 19?');
            return response.response.text();
          })
        }
      />
      <AppButton
        title="Gemini image generateContent"
        onPress={() =>
          run('Gemini image generateContent', async () => {
            const model = getGenerativeModel(ai, {
              model: 'gemini-3.1-flash-image',
              generationConfig: {
                responseModalities: [ResponseModality.IMAGE],
                imageConfig: {
                  aspectRatio: ImageConfigAspectRatio.LANDSCAPE_16x9,
                  imageSize: ImageConfigImageSize.SIZE_1K,
                },
              },
            });
            const response = await model.generateContent('Draw a red bicycle on a beach at sunset');
            const parts = response.response.candidates?.[0]?.content?.parts ?? [];
            const imagePart = parts.find(part => part.inlineData?.mimeType?.startsWith('image/'));
            return {
              mimeType: imagePart?.inlineData?.mimeType ?? null,
              aspectRatio: ImageConfigAspectRatio.LANDSCAPE_16x9,
              imageSize: ImageConfigImageSize.SIZE_1K,
              responseModality: ResponseModality.IMAGE,
            };
          })
        }
      />

      <AppButton
        title="RequestOptions + AbortSignal"
        onPress={() =>
          run('RequestOptions + AbortSignal', async () => {
            const model = getGenerativeModel(
              ai,
              { model: 'gemini-3.1-flash-lite' },
              { timeout: 60000 },
            );
            const controller = new AbortController();
            const abortTimer = setTimeout(() => controller.abort(), 10000);
            try {
              const response = await model.generateContent('Write a haiku about the sea.', {
                signal: controller.signal,
              });
              return response.response.text();
            } finally {
              clearTimeout(abortTimer);
            }
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: the AIError control calls getGenerativeModel without a model on purpose, so it
        always hits the NO_MODEL error and reports the code.
      </Text>
      <AppButton
        title="AIError + AIErrorCode (NO_MODEL)"
        onPress={() =>
          run('AIError', () => {
            try {
              // @ts-expect-error intentional missing model for throw demo
              getGenerativeModel(ai, {});
            } catch (e) {
              if (e instanceof AIError) {
                return {
                  isAIError: true,
                  code: e.code,
                  isNoModel: e.code === AIErrorCode.NO_MODEL,
                };
              }
              throw e;
            }
            return { isAIError: false };
          })
        }
      />

      <Text style={styles.section}>Live and templates</Text>
      <AppButton
        title="getLiveGenerativeModel"
        onPress={() =>
          run('getLiveGenerativeModel', () => {
            const liveModel = getLiveGenerativeModel(ai, {
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            });
            return { model: liveModel.model };
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: getLiveGenerativeModel throws AIError (NO_MODEL) when modelParams.model is missing.
      </Text>
      <AppButton
        title="getLiveGenerativeModel missing model (throws)"
        onPress={() =>
          run('getLiveGenerativeModel missing model', () =>
            // @ts-expect-error intentional missing model for throw demo
            getLiveGenerativeModel(ai, {}),
          )
        }
      />
      <AppButton
        title="LiveSession connect"
        onPress={() =>
          run('LiveSession.connect', async () => {
            const liveModel = getLiveGenerativeModel(ai, {
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
              generationConfig: {
                responseModalities: [ResponseModality.AUDIO],
                outputAudioTranscription: {},
              },
            });
            const session = await liveModel.connect();
            await session.sendTextRealtime('ping from test-expo');
            await session.close();
            return { closed: session.isClosed };
          })
        }
      />
      <AppButton
        title="LiveSession send + audio + video + function responses"
        onPress={() =>
          run('LiveSession inputs', async () => {
            const liveModel = getLiveGenerativeModel(ai, {
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
              generationConfig: {
                responseModalities: [ResponseModality.AUDIO],
                outputAudioTranscription: {},
              },
              tools: [
                {
                  functionDeclarations: [
                    {
                      name: 'fetchWeather',
                      description: 'Get the weather conditions for a city',
                      parameters: Schema.object({
                        properties: { city: Schema.string({ description: 'The city name.' }) },
                      }),
                    },
                  ],
                },
              ],
            });
            const session = await liveModel.connect();
            await session.sendAudioRealtime({ mimeType: 'audio/pcm', data: SILENT_PCM_BASE64 });
            await session.sendVideoRealtime({ mimeType: 'image/png', data: TINY_PNG_BASE64 });
            await session.send('What is the weather in Boston? Use the fetchWeather tool.');
            let toolCalls = 0;
            let transcript = '';
            for await (const message of session.receive()) {
              if (message.type === 'toolCall') {
                toolCalls += message.functionCalls.length;
                await session.sendFunctionResponses(
                  message.functionCalls.map(call => ({
                    id: call.id,
                    name: call.name,
                    response: { temperature: 38, cloudConditions: 'partlyCloudy' },
                  })),
                );
              } else if (message.type === 'serverContent') {
                transcript += message.outputTranscription?.text ?? '';
                if (message.turnComplete) {
                  break;
                }
              }
            }
            await session.close();
            return { toolCalls, transcript };
          })
        }
      />
      <AppButton
        title="Live contextWindowCompression"
        onPress={() =>
          run('Live contextWindowCompression', async () => {
            const liveModel = getLiveGenerativeModel(ai, {
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
              generationConfig: {
                contextWindowCompression: {
                  triggerTokens: 100000,
                  slidingWindow: { targetTokens: 80000 },
                },
              },
            });
            const session = await liveModel.connect();
            await session.sendTextRealtime('Start a long conversation...');
            await session.close();
            return { closed: session.isClosed };
          })
        }
      />
      <AppButton
        title="LiveSession resumeSession"
        onPress={() =>
          run('LiveSession.resumeSession', async () => {
            const liveModel = getLiveGenerativeModel(ai, {
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            });
            const session = await liveModel.connect({});
            await session.sendTextRealtime('Start a conversation we can resume later.');
            let resumptionHandle: string | undefined;
            for await (const message of session.receive()) {
              if (message.type === 'sessionResumptionUpdate' && message.resumable) {
                resumptionHandle = message.newHandle;
                break;
              }
            }
            if (resumptionHandle) {
              await session.resumeSession({ handle: resumptionHandle });
              await session.sendTextRealtime('Pick up where we left off.');
            }
            await session.close();
            return {
              closed: session.isClosed,
              hadResumptionHandle: Boolean(resumptionHandle),
            };
          })
        }
      />
      <AppButton
        title="getTemplateGenerativeModel"
        onPress={() =>
          run('getTemplateGenerativeModel', () => {
            const templateModel = getTemplateGenerativeModel(ai);
            return { created: Boolean(templateModel) };
          })
        }
      />
      <AppButton
        title="TemplateGenerativeModel.generateContent"
        onPress={() =>
          run('TemplateGenerativeModel.generateContent', async () => {
            const templateModel = getTemplateGenerativeModel(ai);
            const response = await templateModel.generateContent(
              'weather-assistant-template',
              { city: 'Boston' },
              undefined,
              {
                retrievalConfig: {
                  latLng: { latitude: 42.3601, longitude: -71.0589 },
                  languageCode: 'en-US',
                },
              },
            );
            return response.response.text();
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: the template controls need a server prompt template with this ID in your Firebase
        project, otherwise the request fails.
      </Text>
      <AppButton
        title="TemplateGenerativeModel.generateContentStream"
        onPress={() =>
          run('TemplateGenerativeModel.generateContentStream', async () => {
            const templateModel = getTemplateGenerativeModel(ai);
            const streamResult = await templateModel.generateContentStream(
              'weather-assistant-template',
              { city: 'Boston' },
            );
            let text = '';
            for await (const chunk of streamResult.stream) {
              text += chunk.text();
            }
            return text;
          })
        }
      />
      <AppButton
        title="TemplateGenerativeModel.startChat"
        onPress={() =>
          run('TemplateGenerativeModel.startChat', async () => {
            const templateModel = getTemplateGenerativeModel(ai);
            const chat = templateModel.startChat({
              templateId: 'weather-assistant-template',
              templateVariables: { city: 'Boston' },
            });
            const response = await chat.sendMessage('What should I wear?');
            return response.response.text();
          })
        }
      />
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.subtleText, fontSize: 13, lineHeight: 18 },
  section: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  warning: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
