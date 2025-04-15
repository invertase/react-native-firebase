import React from 'react';
import { AppRegistry, Button, View } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel, Schema } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
      <View style={{ height: 90 }} />
      <Button
        title="generateContent"
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
        title="generateContentStream"
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
      <Button
        title="generateContentStream multi-modal"
        onPress={async () => {
          try {
            const app = getApp();
            const vertexai = getVertexAI(app);
            const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });
            const prompt = 'What can you see?';
            const base64Emoji =
              'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=';

            // Call generateContentStream with the text and images
            const response = await model.generateContentStream([
              prompt,
              { inlineData: { mimeType: 'image/png', data: base64Emoji } },
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
        title="generate JSON response"
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
        title="startChat"
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
        title="countTokens"
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
        title="function calling"
        onPress={async () => {
          // This function calls a hypothetical external API that returns
          // a collection of weather information for a given location on a given date.
          // `location` is an object of the form { city: string, state: string }
          async function fetchWeather({ location, date }) {
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

AppRegistry.registerComponent('testing', () => App);
