/* eslint-disable no-console */
import React, { JSX, useState } from 'react';
import { Button, View, Text, Pressable } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import {
  getAI,
  getGenerativeModel,
  Schema,
  getImagenModel,
  AI,
  GenerativeModel,
  GenerateContentResult,
  GenerateContentStreamResult,
  ChatSession,
} from '@react-native-firebase/ai';
import {
  PDF_BASE_64,
  POEM_BASE_64,
  VIDEO_BASE_64,
  IMAGE_BASE_64,
  EMOJI_BASE_64,
} from '../vertexai/base-64-media';

type MediaOption = 'image' | 'pdf' | 'video' | 'audio' | 'emoji';

interface OptionSelectorProps {
  selectedOption: MediaOption;
  setSelectedOption: (option: MediaOption) => void;
}

function OptionSelector({ selectedOption, setSelectedOption }: OptionSelectorProps): JSX.Element {
  const options: MediaOption[] = ['image', 'pdf', 'video', 'audio', 'emoji'];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}>
      {options.map(option => {
        const isSelected = selectedOption === option;
        return (
          <Pressable
            key={option}
            onPress={() => setSelectedOption(option)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 15,
              margin: 5,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isSelected ? '#007bff' : '#ccc',
              backgroundColor: isSelected ? '#007bff' : '#fff',
            }}
          >
            <Text style={{ color: isSelected ? '#fff' : '#000', fontSize: 16 }}>
              {option.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface MediaDetails {
  data: string;
  mimeType: string;
  prompt: string;
}
export function AITestComponent() {
  const [selectedOption, setSelectedOption] = useState('image');
  const getMediaDetails = option => {
    switch (option) {
      case 'image':
        return { data: IMAGE_BASE_64.trim(), mimeType: 'image/jpeg', prompt: 'What can you see?' };
      case 'pdf':
        return {
          data: PDF_BASE_64.trim(),
          mimeType: 'application/pdf',
          prompt: 'What can you see?',
        };
      case 'video':
        return { data: VIDEO_BASE_64.trim(), mimeType: 'video/mp4', prompt: 'What can you see?' };
      case 'audio':
        return { data: POEM_BASE_64.trim(), mimeType: 'audio/mp3', prompt: 'What can you hear?' };
      case 'emoji':
        return { data: EMOJI_BASE_64.trim(), mimeType: 'image/png', prompt: 'What can you see?' };
      default:
        console.error('Invalid option selected');
        return null;
    }
  };

  return (
    <View>
      <View style={{ height: 90 }} />
      <Button
        title="Generate Content"
        onPress={async (): Promise<void> => {
          try {
            const app = getApp();
            const ai: AI = getAI(app);
            const model: GenerativeModel = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });

            const result: GenerateContentResult = await model.generateContent('What is 2 + 2?');

            console.log('result', result.response.text());
          } catch (e) {
            console.error(e);
          }
        }}
      />
      <Button
        title="Generate Content Stream"
        onPress={async (): Promise<void> => {
          try {
            const app = getApp();
            const ai: AI = getAI(app);
            const model: GenerativeModel = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });

            const result: GenerateContentStreamResult = await model.generateContentStream(
              'Write me a short, funny rap',
            );

            let text: string = '';
            for await (const chunk of result.stream) {
              const chunkText: string = chunk.text();
              console.log(chunkText);

              text += chunkText;
            }

            console.log('result', text);
          } catch (e) {
            console.error(e);
          }
        }}
      />
      <Text style={{ margin: 10, fontSize: 16 }}>Select a File Type for multi-modal input:</Text>
      <OptionSelector
        selectedOption={selectedOption as MediaOption}
        setSelectedOption={setSelectedOption}
      />
      <Button
        title="Generate Content Stream multi-modal"
        onPress={async (): Promise<void> => {
          try {
            const app = getApp();
            const ai: AI = getAI(app);
            const model: GenerativeModel = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });
            const mediaDetails: MediaDetails | null = getMediaDetails(selectedOption);
            if (!mediaDetails) return;

            const { data, mimeType, prompt } = mediaDetails;

            // Call generateContentStream with the text and images
            const response: GenerateContentStreamResult = await model.generateContentStream([
              prompt,
              { inlineData: { mimeType, data } },
            ]);

            let text: string = '';
            for await (const chunk of response.stream) {
              text += chunk.text();
            }

            console.log('Generated text:', text);
          } catch (e) {
            console.error(e);
          }
        }}
      />
      <Button
        title="Generate JSON Response"
        onPress={async (): Promise<void> => {
          try {
            const app = getApp();
            const ai: AI = getAI(app);
            const jsonSchema = Schema.object({
              properties: {
                characters: Schema.array({
                  items: Schema.object({
                    properties: {
                      name: Schema.string(),
                      accessory: Schema.string(),
                      age: Schema.number(),
                      species: Schema.string(),
                    },
                    optionalProperties: ['accessory'],
                  }),
                }),
              },
            });
            const model: GenerativeModel = getGenerativeModel(ai, {
              model: 'gemini-1.5-flash',
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: jsonSchema,
              },
            });

            const prompt: string =
              "For use in a children's card game, generate 10 animal-based characters.";

            const result: GenerateContentResult = await model.generateContent(prompt);
            console.log(result.response.text());
          } catch (e) {
            console.error(e);
          }
        }}
      />
      <Button
        title="Start Chat"
        onPress={async (): Promise<void> => {
          try {
            const app = getApp();
            const ai: AI = getAI(app);
            const model: GenerativeModel = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });

            const chat: ChatSession = model.startChat({
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
              generationConfig: {
                maxOutputTokens: 100,
              },
            });

            const msg: string = 'How many paws are in my house?';
            const result: GenerateContentStreamResult = await chat.sendMessageStream(msg);

            let text: string = '';
            for await (const chunk of result.stream) {
              const chunkText: string = chunk.text();
              text += chunkText;
            }
            console.log(text);
            chat.getHistory();
          } catch (e) {
            console.error(e);
          }
        }}
      />
      <Button
        title="Count Tokens"
        onPress={async (): Promise<void> => {
          try {
            const app = getApp();
            const ai: AI = getAI(app);
            const model: GenerativeModel = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });

            const result = await model.countTokens('What is 2 + 2?');

            console.log('totalBillableCharacters', result.totalBillableCharacters);
            console.log('totalTokens', result.totalTokens);
          } catch (e) {
            console.error(e);
          }
        }}
      />

      <Button
        title="Function Calling"
        onPress={async (): Promise<void> => {
          // This function calls a hypothetical external API that returns
          // a collection of weather information for a given location on a given date.
          // `location` is an object of the form { city: string, state: string }

          interface WeatherLocation {
            city: string;
            state: string;
          }

          interface WeatherData {
            temperature: number;
            chancePrecipitation: string;
            cloudConditions: string;
            location: WeatherLocation | undefined;
            date: string | undefined;
          }

          async function fetchWeather({
            location,
            date,
          }: {
            location: WeatherLocation | undefined;
            date: string | undefined;
          }): Promise<WeatherData> {
            // For demo purposes, this hypothetical response is hardcoded here in the expected format.
            return {
              temperature: 38,
              chancePrecipitation: '56%',
              cloudConditions: 'partlyCloudy',
              location,
              date,
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
                      description:
                        'The name of the city and its state for which to get ' +
                        'the weather. Only cities in the USA are supported.',
                      properties: {
                        city: Schema.string({
                          description: 'The city of the location.',
                        }),
                        state: Schema.string({
                          description: 'The US state of the location.',
                        }),
                      },
                    }),
                    date: Schema.string({
                      description:
                        'The date for which to get the weather. Date must be in the' +
                        ' format: YYYY-MM-DD.',
                    }),
                  },
                }),
              },
            ],
          };
          try {
            const app = getApp();
            const ai: AI = getAI(app);
            const model: GenerativeModel = getGenerativeModel(ai, {
              model: 'gemini-1.5-flash',
              // @ts-ignore
              tools: fetchWeatherTool,
            });

            const chat: ChatSession = model.startChat();
            const prompt: string = 'What was the weather in Boston on October 17, 2024?';

            // Send the user's question (the prompt) to the model using multi-turn chat.
            let result: GenerateContentResult = await chat.sendMessage(prompt);
            const functionCalls = result.response.functionCalls();
            let functionCall: any;
            let functionResult: WeatherData | undefined;
            // When the model responds with one or more function calls, invoke the function(s).
            if (functionCalls && functionCalls.length > 0) {
              for (const call of functionCalls) {
                if (call.name === 'fetchWeather') {
                  // Forward the structured input data prepared by the model
                  // to the hypothetical external API.
                  // @ts-ignore
                  functionResult = await fetchWeather(call.args);
                  functionCall = call;
                }
              }
            }
            result = await chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name, // "fetchWeather"
                  // @ts-ignore
                  response: functionResult,
                },
              },
            ]);
            console.log(result.response.text());
          } catch (e) {
            console.error(e);
          }
        }}
      />
      <Button
        title="Generate image using Imagen"
        onPress={async (): Promise<void> => {
          try {
            const app = getApp();
            const ai: AI = getAI(app);

            const model = getImagenModel(ai, {
              model: 'imagen-3.0-generate-002',
            });

            const prompt: string = 'Generate an image of London bridge with sharks in the water';

            const result = await model.generateImages(prompt);
            const images = result;
            console.log('Generated images:', images);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </View>
  );
}
