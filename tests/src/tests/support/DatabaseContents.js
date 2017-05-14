export default {
  DEFAULT: {
    array: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ],
    boolean: true,
    string: 'foobar',
    number: 123567890,
    object: {
      foo: 'bar',
    },
  },

  NEW: {
    array: [
      9, 8, 7, 6, 5, 4,
    ],
    boolean: false,
    string: 'baz',
    number: 84564564,
    object: {
      foo: 'baz',
    },
  },

  ISSUES: {
    // https://github.com/invertase/react-native-firebase/issues/100
    100: {
      1: {
        someKey: 'someValue',
        someOtherKey: 'someOtherValue',
      },
      2: {
        someKey: 'someValue',
        someOtherKey: 'someOtherValue',
      },
      3: {
        someKey: 'someValue',
        someOtherKey: 'someOtherValue',
      },
    },

    // https://github.com/invertase/react-native-firebase/issues/108
    108: {
      foobar: {
        name: 'Foobar Pizzas',
        latitude: 34.1013717,
      },
      notTheFoobar: {
        name: 'Not the pizza you\'re looking for',
        latitude: 34.456787,
      },
      notAFloat: {
        name: 'Not a float',
        latitude: 37,
      },
    },
  },
};
