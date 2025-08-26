/* eslint-disable no-console */
import React, { useState } from 'react';
import { Button, View, Text, Pressable } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel, Schema } from '@react-native-firebase/vertexai';
import {
  PDF_BASE_64,
  POEM_BASE_64,
  VIDEO_BASE_64,
  IMAGE_BASE_64,
  EMOJI_BASE_64,
} from './base-64-media';

// eslint-disable-next-line react/prop-types
function OptionSelector({ selectedOption, setSelectedOption }) {
  const options = ['image', 'pdf', 'video', 'audio', 'emoji'];

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

export function VertexAITestComponent() {
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
        onPress={async () => {
          try {
            const app = getApp();
            const vertexai = getVertexAI(app);
            const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

            const result = await model.generateContent('What is 2 + 2?');

            console.log('result', result.response.text());
          } catch (e) {
            console.error(e);
          }
        }}
      />
      <Button
        title="Generate Content Stream"
        onPress={async () => {
          try {
            const app = getApp();
            const vertexai = getVertexAI(app);
            const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

            const result = await model.generateContentStream('Write me a short, funny rap');

            let text = '';
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
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
      <OptionSelector selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <Button
        title="Generate Content Stream multi-modal"
        onPress={async () => {
          try {
            const app = getApp();
            const vertexai = getVertexAI(app);
            const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });
            const mediaDetails = getMediaDetails(selectedOption);
            if (!mediaDetails) return;

            const { data, mimeType, prompt } = mediaDetails;

            // Call generateContentStream with the text and images
            const response = await model.generateContentStream([
              prompt,
              { inlineData: { mimeType, data } },
            ]);

            let text = '';
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
        onPress={async () => {
          try {
            const app = getApp();
            const vertexai = getVertexAI(app);
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
            const model = getGenerativeModel(vertexai, {
              model: 'gemini-1.5-flash',
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: jsonSchema,
              },
            });

            let prompt = "For use in a children's card game, generate 10 animal-based characters.";

            let result = await model.generateContent(prompt);
            console.log(result.response.text());
          } catch (e) {
            console.error(e);
          }
        }}
      />
      <Button
        title="Start Chat"
        onPress={async () => {
          try {
            const app = getApp();
            const vertexai = getVertexAI(app);
            const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

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
              generationConfig: {
                maxOutputTokens: 100,
              },
            });

            const msg = 'How many paws are in my house?';
            const result = await chat.sendMessageStream(msg);

            let text = '';
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
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
        onPress={async () => {
          try {
            const app = getApp();
            const vertexai = getVertexAI(app);
            const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

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
        onPress={async () => {
          // This function calls a hypothetical external API that returns
          // a collection of weather information for a given location on a given date.
          // `location` is an object of the form { city: string, state: string }
          async function fetchWeather({ _location, _date }) {
            // For demo purposes, this hypothetical response is hardcoded here in the expected format.
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
            const vertexai = getVertexAI(app);
            const model = getGenerativeModel(vertexai, {
              model: 'gemini-1.5-flash',
              tools: fetchWeatherTool,
            });

            const chat = model.startChat();
            const prompt = 'What was the weather in Boston on October 17, 2024?';

            // Send the user's question (the prompt) to the model using multi-turn chat.
            let result = await chat.sendMessage(prompt);
            const functionCalls = result.response.functionCalls();
            let functionCall;
            let functionResult;
            // When the model responds with one or more function calls, invoke the function(s).
            if (functionCalls.length > 0) {
              for (const call of functionCalls) {
                if (call.name === 'fetchWeather') {
                  // Forward the structured input data prepared by the model
                  // to the hypothetical external API.
                  functionResult = await fetchWeather(call.args);
                  functionCall = call;
                }
              }
            }
            result = await chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name, // "fetchWeather"
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
    </View>
  );
}
