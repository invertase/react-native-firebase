import DatabaseContents from './DatabaseContents';

const databaseTypeMap =
  Object.keys(DatabaseContents.DEFAULT).reduce((dataTypeMap, dataType) => {
    // eslint-disable-next-line no-param-reassign
    dataTypeMap[`tests/types/${dataType}`] = DatabaseContents.DEFAULT[dataType];
    return dataTypeMap;
  }, {});

export default databaseTypeMap;
