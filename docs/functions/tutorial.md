---
title: Tutorial | Cloud Functions
description: Building a product catalog with Cloud Functions
---

# Cloud Functions Tutorial

Firebase Cloud Functions provides the ability to write and deploy HTTPS endpoints to a managed 
environment. This tutorial will cover setting up the Firebase CLI on your machine, writing 
a HTTPS function and querying the response in your React Native application.

To find out more about Cloud Functions, view [Firebase's documentation](https://firebase.google.com/docs/functions/?utm_source=invertase&utm_medium=react-native-firebase&utm_campaign=tutorial). 

## What are we building?

This tutorial will create a simple API endpoint which returns a list of products using the [Faker](https://www.npmjs.com/package/faker)
library. This data will be used to create a simple product listing screen on your React Native application.

### Installing the Firebase CLI

Firebase provides a CLI which is required to build and deploy Cloud Functions. To install the CLI, install the `firebase-tools`
package globally on your computer from your terminal:

```bash
npm install -g firebase-tools
```

Once installed, login to Firebase with the CLI. This process will automatically open a browser instance giving you 
the ability to login to your Firebase account.

```bash
firebase login
```

Once logged in, create a new directory on your computer called `product-api`. This will be used as our working 
directory where our Cloud Functions will be written and deployed from. Within this directory, run the following
command from your terminal to initialize a new project structure:

```bash
firebase init functions 
```

You will be offered two options for language support, for this tutorial select *JavaScript*. Allow the CLI to install
dependencies using npm. Once complete your project structure will look like this:

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
      +- package.json  # npm package file describing your Cloud Functions code
      |
      +- index.js      # main source file for your Cloud Functions code
      |
      +- node_modules/ # directory where your dependencies (declared in
                       # package.json) are installed
```

### Writing your first Cloud Function

The Firebase CLI has created a project structure and also installed a number of dependencies which will be used to build
our Cloud Functions.

Before getting started, install the `faker` library in the `functions` directory using npm:

```bash
cd functions/
npm install --save faker
```

Now it's time to write your first Cloud Function! Open up the generated `functions/index.js` file in your chosen 
editor. The CLI has already imported the `firebase-functions` package required to build a Cloud Function. Firebase
used [named exports](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export) to help
identify functions. These exports are used to build the API endpoint name which will be accessible from our 
React Native application.

For this tutorial, we are creating a product listing API. Go ahead and create a new HTTPS callable named function called
`products`:

```js
// functions/index.js
const functions = require('firebase-functions');

exports.products = functions.https.onRequest((request, response) => {
    // TODO
});
```

The `onRequest` callback returns two objects:

- `request`: contains information about our incoming request, such as headers and parameters.
- `response`: provides a number of functions to help return data in a standardized format back to users.

For in-depth information on these objects, please reference the [express](https://expressjs.com/) documentation.

We can now return an array of our products, generated from the `faker` library. As we are mocking a dataset,
it's important to keep consistent results for each request. The data should be generated before the request is received,
rather than a new dataset being generated on each request:

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

exports.products = functions.https.onRequest((request, response) => {
    return response.json(products);
});
```

### Testing your functions

Before deploying our functions project, we can run the `serve` command which builds a locally accessible instance
of our Cloud Functions. Run the following command from within the `functions/` directory:

```
npm run serve
```

Once booted, the CLI will be provide a local web server with the `products` endpoint openly available, e.g:

```
functions: products: http://localhost:5000/rnfirebase-demo/us-central1/products
```

In your terminal (or browser), access the endpoint provided. Our list of generated products is ready for use.

```bash
curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET  http://localhost:5000/rnfirebase-demo/us-central1/products
```

*Note: we use `response.json()` to automatically apply headers so our request can expect a valid JSON Content-Type
response.*

### Handling pagination

Our HTTPS endpoint currently returns all 100 results. Whilst this is ok for demo purposes, in a real life application
it's important to think about the user. More data requires more bandwidth and longer response times (especially when
used with a real database!). Paginating the data allows us to only return a subset of the entire dataset, and is 
achievable with our own Cloud Function using request parameters.

Lets setup the API to accept `page` & `limit` parameters, which will be used to limit and skip our dataset:

```js
exports.products = functions.https.onRequest((request, response) => {
    const { page = 1, limit = 10 } = request.query;

    return response.json(products);
});
```

We access the params from the `query` field on the `request` object. It's also important to ensure default values
are set in-case the incoming request mitigates them. Using our query parameters we can now paginate the data:

```js
exports.products = functions.https.onRequest((request, response) => {
    const { page = 1, limit = 10 } = request.query;

    const startAt = (page - 1) * limit;
    const endAt = startAt + limit;
    
    return response.json(
        products.slice(startAt, endAt)
    );
});
```

When requesting our data, you will be limited to the first 10 results! To change the pagination values, change the
query parameters on the request, e.g:

```
curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET  http://localhost:5000/rnfirebase-demo/us-central1/products?page=2&limit=15
```

### Integrating with React Native

With the HTTPS endpoint now ready for use, lets go ahead and integrate our dataset into a React Native application
using the Cloud Functions module.

> If you haven't already, install the `@react-native-firebase/functions` package by following the instructions on the 
[overview page](#).

TODO

### Deploying your Cloud Functions to production

With our app successfully integrating with our HTTPS callable Cloud Function, we can deploy our project to a 
production ready instance on Firebase. Back in our `product-api` project, run the following command from your 
terminal, inside of the `functions/` directory:

```bash
npm run deploy
```

Once complete, your Cloud Function will be available from a publicly accessible endpoint, for example:

```
https://us-central1-rnfirebase-demo-23aa8.cloudfunctions.net/products
``` 

#### Updating the functions emulator

With our Cloud Functions deployed, we are now able to update the application to use the production endpoint. Common
practice is to interchange the functions emulator based on whether the React Native application is in development mode:

```js
import functions from '@react-native-firebase/functions';

const emulator = __DEV__ ?
  'http://localhost:5000' :
  'https://us-central1-rnfirebase-demo-23aa8.cloudfunctions.net';
  
functions().useFunctionsEmulator(emulator);
```

## Summary

This tutorial has only scratched the surface of what is achievable with Cloud Functions and React Native. Our product
api is simple, however provides a great backbone to help develop a production ready API using Cloud Functions.

If you're interested in learning more, check out the following resources:

- [Firebase Cloud Function Documentation](https://firebase.google.com/docs/functions/?utm_source=invertase&utm_medium=react-native-firebase&utm_campaign=tutorial)
