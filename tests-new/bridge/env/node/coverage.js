const { createCoverageMap } = require('istanbul-lib-coverage');

const rootMap = createCoverageMap({});

module.exports = {
  collect() {
    if (bridge.context && bridge.context.__coverage__) {
      rootMap.merge(Object.assign({}, bridge.context.__coverage__));
      global.__coverage__ = rootMap.toJSON();
    }
  },
  summary() {
    return rootMap.getCoverageSummary();
  },

  json() {
    return rootMap.toJSON();
  },
};
