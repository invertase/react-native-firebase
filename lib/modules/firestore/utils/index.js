/**
 * @flow
 */

const buildFieldPathData = (segments: string[], value: any): Object => {
  if (segments.length === 1) {
    return {
      [segments[0]]: value,
    };
  }
  return {
    [segments[0]]: buildFieldPathData(segments.slice(1), value),
  };
};

export const mergeFieldPathData = (data: Object, segments: string[], value: any): Object => {
  if (segments.length === 1) {
    return {
      ...data,
      [segments[0]]: value,
    };
  } else if (data[segments[0]]) {
    return {
      ...data,
      [segments[0]]: mergeFieldPathData(data[segments[0]], segments.slice(1), value),
    };
  }
  return {
    ...data,
    [segments[0]]: buildFieldPathData(segments.slice(1), value),
  };
};
