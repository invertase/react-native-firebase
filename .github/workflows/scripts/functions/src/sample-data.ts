/*
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

const SAMPLE_DATA: { [key: string]: any } = {
  number: 1234,
  string: 'acde',
  boolean: true,
  null: null,
  object: {
    number: 1234,
    string: 'acde',
    boolean: true,
    null: null,
  },
  array: [1234, 'acde', true, null],
  deepObject: {
    array: [1234, 'acde', false, null],
    object: {
      number: 1234,
      string: 'acde',
      boolean: true,
      null: null,
      array: [1234, 'acde', true, null],
    },
    number: 1234,
    string: 'acde',
    boolean: true,
    null: null,
  },
  deepArray: [
    1234,
    'acde',
    true,
    null,
    [1234, 'acde', true, null],
    {
      number: 1234,
      string: 'acde',
      boolean: true,
      null: null,
      array: [1234, 'acde', true, null],
    },
  ],
  deepMap: {
    number: 123,
    string: 'foo',
    booleanTrue: true,
    booleanFalse: false,
    null: null,
    list: ['1', 2, true, false],
    map: {
      number: 123,
      string: 'foo',
      booleanTrue: true,
      booleanFalse: false,
      null: null,
    },
  },
  deepList: [
    '1',
    2,
    true,
    false,
    ['1', 2, true, false],
    {
      number: 123,
      string: 'foo',
      booleanTrue: true,
      booleanFalse: false,
      null: null,
    },
  ],
};

export default SAMPLE_DATA;
