/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, expect, it } from '@jest/globals';
import { Schema } from '../lib/requests/schema-builder';
import { VertexAIErrorCode } from '../lib/types';

describe('Schema builder', () => {
  it('builds integer schema', () => {
    const schema = Schema.integer();
    expect(schema.toJSON()).toEqual({
      type: 'integer',
      nullable: false,
    });
  });

  it('builds integer schema with options and overrides', () => {
    const schema = Schema.integer({ nullable: true, format: 'int32' });
    expect(schema.toJSON()).toEqual({
      type: 'integer',
      format: 'int32',
      nullable: true,
    });
  });

  it('builds number schema', () => {
    const schema = Schema.number();
    expect(schema.toJSON()).toEqual({
      type: 'number',
      nullable: false,
    });
  });

  it('builds number schema with options and unknown options', () => {
    const schema = Schema.number({ format: 'float', futureOption: 'test' });
    expect(schema.toJSON()).toEqual({
      type: 'number',
      format: 'float',
      futureOption: 'test',
      nullable: false,
    });
  });

  it('builds boolean schema', () => {
    const schema = Schema.boolean();
    expect(schema.toJSON()).toEqual({
      type: 'boolean',
      nullable: false,
    });
  });

  it('builds string schema', () => {
    const schema = Schema.string({ description: 'hey' });
    expect(schema.toJSON()).toEqual({
      type: 'string',
      description: 'hey',
      nullable: false,
    });
  });

  it('builds enumString schema', () => {
    const schema = Schema.enumString({
      example: 'east',
      enum: ['east', 'west'],
    });
    expect(schema.toJSON()).toEqual({
      type: 'string',
      example: 'east',
      enum: ['east', 'west'],
      nullable: false,
    });
  });

  it('builds an object schema', () => {
    const schema = Schema.object({
      properties: {
        someInput: Schema.string(),
      },
    });

    expect(schema.toJSON()).toEqual({
      type: 'object',
      nullable: false,
      properties: {
        someInput: {
          type: 'string',
          nullable: false,
        },
      },
      required: ['someInput'],
    });
  });

  it('builds an object schema with optional properties', () => {
    const schema = Schema.object({
      properties: {
        someInput: Schema.string(),
        someBool: Schema.boolean(),
      },
      optionalProperties: ['someBool'],
    });
    expect(schema.toJSON()).toEqual({
      type: 'object',
      nullable: false,
      properties: {
        someInput: {
          type: 'string',
          nullable: false,
        },
        someBool: {
          type: 'boolean',
          nullable: false,
        },
      },
      required: ['someInput'],
    });
  });

  it('builds layered schema - partially filled out', () => {
    const schema = Schema.array({
      items: Schema.object({
        properties: {
          country: Schema.string({
            description: 'A country name',
          }),
          population: Schema.integer(),
          coordinates: Schema.object({
            properties: {
              latitude: Schema.number({ format: 'float' }),
              longitude: Schema.number({ format: 'double' }),
            },
          }),
          hemisphere: Schema.object({
            properties: {
              latitudinal: Schema.enumString({ enum: ['N', 'S'] }),
              longitudinal: Schema.enumString({ enum: ['E', 'W'] }),
            },
          }),
          isCapital: Schema.boolean(),
        },
      }),
    });
    expect(schema.toJSON()).toEqual(layeredSchemaOutputPartial);
  });

  it('builds layered schema - fully filled out', () => {
    const schema = Schema.array({
      items: Schema.object({
        description: 'A country profile',
        nullable: false,
        properties: {
          country: Schema.string({
            nullable: false,
            description: 'Country name',
            format: undefined,
          }),
          population: Schema.integer({
            nullable: false,
            description: 'Number of people in country',
            format: 'int64',
          }),
          coordinates: Schema.object({
            nullable: false,
            description: 'Latitude and longitude',
            properties: {
              latitude: Schema.number({
                nullable: false,
                description: 'Latitude of capital',
                format: 'float',
              }),
              longitude: Schema.number({
                nullable: false,
                description: 'Longitude of capital',
                format: 'double',
              }),
            },
          }),
          hemisphere: Schema.object({
            nullable: false,
            description: 'Hemisphere(s) country is in',
            properties: {
              latitudinal: Schema.enumString({ enum: ['N', 'S'] }),
              longitudinal: Schema.enumString({ enum: ['E', 'W'] }),
            },
          }),
          isCapital: Schema.boolean({
            nullable: false,
            description: "This doesn't make a lot of sense but it's a demo",
          }),
          elevation: Schema.integer({
            nullable: false,
            description: 'Average elevation',
            format: 'float',
          }),
        },
        optionalProperties: [],
      }),
    });

    expect(schema.toJSON()).toEqual(layeredSchemaOutput);
  });

  it('can override "nullable" and set optional properties', () => {
    const schema = Schema.object({
      properties: {
        country: Schema.string(),
        elevation: Schema.number(),
        population: Schema.integer({ nullable: true }),
      },
      optionalProperties: ['elevation'],
    });
    expect(schema.toJSON()).toEqual({
      type: 'object',
      nullable: false,
      properties: {
        country: {
          type: 'string',
          nullable: false,
        },
        elevation: {
          type: 'number',
          nullable: false,
        },
        population: {
          type: 'integer',
          nullable: true,
        },
      },
      required: ['country', 'population'],
    });
  });

  it('throws if an optionalProperties item does not exist', () => {
    const schema = Schema.object({
      properties: {
        country: Schema.string(),
        elevation: Schema.number(),
        population: Schema.integer({ nullable: true }),
      },
      optionalProperties: ['cat'],
    });
    expect(() => schema.toJSON()).toThrow(VertexAIErrorCode.INVALID_SCHEMA);
  });
});

const layeredSchemaOutputPartial = {
  type: 'array',
  nullable: false,
  items: {
    type: 'object',
    nullable: false,
    properties: {
      country: {
        type: 'string',
        description: 'A country name',
        nullable: false,
      },
      population: {
        type: 'integer',
        nullable: false,
      },
      coordinates: {
        type: 'object',
        nullable: false,
        properties: {
          latitude: {
            type: 'number',
            format: 'float',
            nullable: false,
          },
          longitude: {
            type: 'number',
            format: 'double',
            nullable: false,
          },
        },
        required: ['latitude', 'longitude'],
      },
      hemisphere: {
        type: 'object',
        nullable: false,
        properties: {
          latitudinal: {
            type: 'string',
            nullable: false,
            enum: ['N', 'S'],
          },
          longitudinal: {
            type: 'string',
            nullable: false,
            enum: ['E', 'W'],
          },
        },
        required: ['latitudinal', 'longitudinal'],
      },
      isCapital: {
        type: 'boolean',
        nullable: false,
      },
    },
    required: ['country', 'population', 'coordinates', 'hemisphere', 'isCapital'],
  },
};

const layeredSchemaOutput = {
  type: 'array',
  nullable: false,
  items: {
    type: 'object',
    description: 'A country profile',
    nullable: false,
    required: ['country', 'population', 'coordinates', 'hemisphere', 'isCapital', 'elevation'],
    properties: {
      country: {
        type: 'string',
        description: 'Country name',
        nullable: false,
      },
      population: {
        type: 'integer',
        format: 'int64',
        description: 'Number of people in country',
        nullable: false,
      },
      coordinates: {
        type: 'object',
        description: 'Latitude and longitude',
        nullable: false,
        required: ['latitude', 'longitude'],
        properties: {
          latitude: {
            type: 'number',
            format: 'float',
            description: 'Latitude of capital',
            nullable: false,
          },
          longitude: {
            type: 'number',
            format: 'double',
            description: 'Longitude of capital',
            nullable: false,
          },
        },
      },
      hemisphere: {
        type: 'object',
        description: 'Hemisphere(s) country is in',
        nullable: false,
        required: ['latitudinal', 'longitudinal'],
        properties: {
          latitudinal: {
            type: 'string',
            nullable: false,
            enum: ['N', 'S'],
          },
          longitudinal: {
            type: 'string',
            nullable: false,
            enum: ['E', 'W'],
          },
        },
      },
      isCapital: {
        type: 'boolean',
        description: "This doesn't make a lot of sense but it's a demo",
        nullable: false,
      },
      elevation: {
        type: 'integer',
        format: 'float',
        description: 'Average elevation',
        nullable: false,
      },
    },
  },
};
