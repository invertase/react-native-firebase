---
title: VertexAI
description: Installation and getting started with VertexAI.
icon: //static.invertase.io/assets/social/firebase-logo.png
next: /analytics/usage
previous: /remote-config/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the vertexai module
yarn add @react-native-firebase/vertexai
```

# What does it do

The Vertex AI Gemini API gives you access to the latest generative AI models from Google. If you need to call the Vertex AI Gemini API directly from your mobile or web app – rather than server-side — you can use the Vertex AI in Firebase SDKs. See the [VertexAI documentation on the firebase website](https://firebase.google.com/docs/vertex-ai) for further information.

# Usage

## Generate text from text-only input

You can call the Gemini API with input that includes only text. For these calls, you need to use a model that supports text-only prompts (like Gemini 1.5 Pro).

Use `generateContent()` which waits for the entire response before returning.

```js
import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
      <Button
        title="generate content"
        onPress={async () => {
          const app = getApp();
          const vertexai = getVertexAI(app);
          const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

          const result = await model.generateContent('What is 2 + 2?');

          console.log(result.response.text());
        }}
      />
    </View>
  );
}
```

Use `generateContentStream()` if you wish to stream the response.

```js
import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
      <Button
        title="generate content stream"
        onPress={async () => {
          const app = getApp();
          const vertexai = getVertexAI(app);
          const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

          const result = await model.generateContentStream('Write a short poem');

          let text = '';
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            text += chunkText;
          }

          console.log(text);
        }}
      />
    </View>
  );
}
```

## Generate text from multi-modal input

You can pass in different input types to generate text responses. **important** - React Native does not have native support for `Blob` and `Buffer` types which might be used to facilitate different modal inputs. You may have to use third party libraries for this functionality.

```js
import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
      <Button
        title="generate content stream multi-modal"
        onPress={async () => {
          const app = getApp();
          const vertexai = getVertexAI(app);
          const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });
          const prompt = 'What can you see?';
          const base64Emoji =
            'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=';

          const response = await model.generateContentStream([
            prompt,
            { inlineData: { mimeType: 'image/png', data: base64Emoji } },
          ]);

          let text = '';
          for await (const chunk of response.stream) {
            text += chunk.text();
          }

          console.log(text);
        }}
      />
    </View>
  );
}
```

## Generate structured output (e.g. JSON)

The VertexAI SDK returns responses as unstructured text by default. However, some use cases require structured text, like JSON. For example, you might be using the response for other downstream tasks that require an established data schema.

```js
import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel, Schema } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
      <Button
        title="generate structured output"
        onPress={async () => {
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
        }}
      />
    </View>
  );
}
```

## Multi-turn conversations

You can build freeform conversations across multiple turns. The Vertex AI in Firebase SDK simplifies the process by managing the state of the conversation, so unlike with `generateContentStream()` or `generateContent()`, you don't have to store the conversation history yourself.

```js
import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
      <Button
        title="start chat session"
        onPress={async () => {
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

          // When you want to see the history of the chat
          const history = await chat.getHistory();
          console.log(history);
        }}
      />
    </View>
  );
}
```

## Function calling

Generative models are powerful at solving many types of problems. However, they are constrained by limitations like:

- They are frozen after training, leading to stale knowledge.
- They can't query or modify external data.

Function calling can help you overcome some of these limitations. Function calling is sometimes referred to as tool use because it allows a model to use external tools such as APIs and functions to generate its final response.

```js
import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
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
        }}
      />
    </View>
  );
}
```

## Count tokens & billable characters

Generative AI models break down data into units called tokens for processing. Each Gemini model has a [maximum number of tokens](https://firebase.google.com/docs/vertex-ai/gemini-models) that it can handle in a prompt and response.

The below shows you how to get an estimate of token count and the number of billable characters for a request.

```js
import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getVertexAI, getGenerativeModel } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
      <Button
        title="count tokens and billable characters"
        onPress={async () => {
          // Count tokens & billable character for text input
          const { totalTokens, totalBillableCharacters } = await model.countTokens(
            'Write a story about a magic backpack.',
          );
          console.log(
            `Total tokens: ${totalTokens}, total billable characters: ${totalBillableCharacters}`,
          );

          // Count tokens & billable character for multi-modal input
          const prompt = "What's in this picture?";
          const imageAsBase64 = '...base64 string image';
          const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageAsBase64 } };

          const { totalTokens, totalBillableCharacters } = await model.countTokens([
            prompt,
            imagePart,
          ]);
          console.log(
            `Total tokens: ${totalTokens}, total billable characters: ${totalBillableCharacters}`,
          );
        }}
      />
    </View>
  );
}
```

## Getting ready for production

For mobile and web apps, you need to protect the Gemini API and your project resources (like tuned models) from abuse by unauthorized clients. You can use Firebase App Check to verify that all API calls are from your actual app. See [Firebase docs for further information](https://firebase.google.com/docs/vertex-ai/app-check).

- Ensure you have setup [App Check for React Native Firebase](/app-check/usage/index)
- Pass in an instance of App Check to VertexAI which, under the hood, will call `appCheck.getToken()` and use it as part of VertexAI API requests to the server.

```js
import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import appCheck from '@react-native-firebase/app-check';
import { getVertexAI, getGenerativeModel } from '@react-native-firebase/vertexai';

function App() {
  return (
    <View>
      <Button
        title="use App Check and pass into getVertexAI()"
        onPress={async () => {
          const app = getApp();
          // Can also pass an instance of auth which will pass in an auth token if a user is signed-in
          const authInstance = auth(app);
          const appCheckInstance = appCheck(app);
          // Configure appCheck instance as per docs....
          const options = {
            appCheck: appCheckInstance,
            auth: authInstance,
          };

          const vertexai = getVertexAI(app, options);
          const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

          const result = await model.generateContent('What is 2 + 2?');

          console.log('result', result.response.text());
        }}
      />
    </View>
  );
}
```
