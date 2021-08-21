---
title: Writing & Deploying Cloud Functions
description: Learn how to write, test & deploy Cloud Functions to your Firebase project.
next: /messaging/usage
previous: /functions/usage
---

Cloud Functions are a powerful asset to a developers workflow, allowing you to build complex backend tasks with
minimal maintenance overhead. The following page outlines the steps required for writing, testing & deploying Cloud Functions to your Firebase project.

## Environment Setup

Firebase provides a CLI which is required to build and deploy Cloud Functions. To install the CLI, install the `firebase-tools` package globally on your computer from your terminal:

```bash
npm install -g firebase-tools
```

Once installed, login to Firebase with the CLI. This process will automatically open a browser instance giving you the ability to login to your Firebase account.

```bash
firebase login
```

Once logged in, create a new directory on your development environment. This will be used as our working directory
where our Cloud Functions will be written and deployed from. Within this directory, run the following command from your
terminal to initialize a new project structure:

```bash
firebase init functions
```

You will be offered two options for language support, for this tutorial select JavaScript. Allow the CLI to install
dependencies using NPM. Once complete your project structure will look like this:

```
myproject
 +- .firebaserc    # Hidden file that helps you quickly switch between
 |                 # projects with `firebase use`
 |
 +- firebase.json  # Describes properties for your project
 |
 +- functions/     # Directory containing all your functions code
      |
      +- .eslintrc.json  # Optional file containing rules for JavaScript linting.
      |
      +- package.json  # NPM package file describing your Cloud Functions code
      |
      +- index.js      # main source file for your Cloud Functions code
      |
      +- node_modules/ # directory where your dependencies (declared in
                       # package.json) are installed
```

## Writing a Function

The Firebase CLI has created a project structure and also installed a number of dependencies which will be used to build our Cloud Functions.

To enable us to mock some fake data to use in the deployed functions, lets use the [`faker`](https://www.npmjs.com/package/faker)
library to create mock data.

```bash
cd functions/
npm install faker
```

Now it's time to write our Cloud Function. Open up the generated `functions/index.js` file in your chosen editor.
The CLI has already imported the `firebase-functions` package required to build a Cloud Function. Firebase uses
[named exports](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export) to help identify
functions. These exports are used to build the API endpoint name which will be accessible from our React Native application.

For this tutorial, we are creating a product listing API. Go ahead and create a new HTTPS callable named function called `listProducts`:

```js
// functions/index.js
const functions = require('firebase-functions');

exports.listProducts = functions.https.onCall((data, context) => {
  // ...
});
```

The `onCall` callback returns two objects:

We can now return an array of products, generated from the `faker` library. As we are mocking a data set, it's important
to keep consistent results for each request. The data should be generated before the request is received, rather than a
new data set being generated on each request:

```js
// functions/index.js
const functions = require('firebase-functions');
const faker = require('faker');

// Initialize products array
const products = [];

// Max number of products
const LIMIT = 100;

// Push a new product to the array
for (let i = 0; i < LIMIT; i++) {
  products.push({
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
  });
}

exports.listProducts = functions.https.onCall((data, context) => {
  return products;
});
```

### Testing your function

Before deploying our functions project, we can run the `serve` command which builds a locally accessible instance of our
Cloud Functions. Run the following command from within the `functions/` directory:

```bash
cd functions/
npm run serve
```

Once booted, the CLI will be provide a local web server with the products endpoint openly available, e.g:

```
functions: listProducts: http://localhost:5000/rnfirebase-demo/us-central1/listProducts
```

In your terminal (or browser), access the endpoint provided. Our list of generated products is ready for use.

```
curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X POST -d '{"data":{}}' http://localhost:5000/rnfirebase-demo/us-central1/listProducts
```

### Security

By default the endpoint will be publicly accessible when deployed. Firebase offers an out-of-the-box solution for handling
authentication, which integrates with the [Authentication](/auth) module. To secure our endpoint for authenticated users only, check whether the `auth`
property exists on the function execution context:

```js
exports.listProducts = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  return products;
});
```

When calling the function without authentication, an error response will be returned to the caller.

If the user is authenticated, we can access the users data via the `context.auth` property. For example their unique user identifier will be available by accessing `context.auth.uid`.

### Handling function arguments

A common requirement for endpoints is calling the endpoint with custom parameters. For example, rather than returning a list
of 1000 products, we can paginate the data by passing in arguments when calling our function.

These arguments can be accessed via the `data` property when the function is executed, let's update our function code to support pagination arguments:

```js
exports.listProducts = functions.https.onCall((data, context) => {
  const { page = 1, limit = 10 } = data;

  const startAt = (page - 1) * limit;
  const endAt = startAt + limit;

  return products.slice(startAt, endAt);
});
```

## Deploying Functions

Once your functions are ready to be deployed, the project provides a `deploy` script which will upload all of your code
onto the Firebase infrastructure and automatically provision production ready endpoints. Within the project, run the
`deploy` script from the `functions` directory:

```bash
cd functions/
npm run deploy
```

Once complete, your Cloud Function will also be available from a publicly accessible endpoint if required, for example:

```
https://us-central1-rnfirebase-demo-23aa8.cloudfunctions.net/listProducts
```

### Calling your function

Once your function has been deployed you can now call it through the React Native Firebase Functions SDK in your application:

```js
import { firebase } from '@react-native-firebase/functions';

// ...

// note the name of our deployed function, 'listProducts', is referenced here:
const { data } = await firebase.functions().httpsCallable('listProducts')({
  page: 1,
  limit: 15,
});

// ...
```
