const { createCoverageMap } = require('istanbul-lib-coverage');

const rootMap = createCoverageMap({});

module.exports = {
  collect() {
    if (bridge.context && bridge.context.__coverage__) {
      try {
        rootMap.merge(Object.assign({}, bridge.context.__coverage__));
        global.__coverage__ = rootMap.toJSON();
      } catch (e) {
        // ignore
      }
    }
  },
  summary() {
    return rootMap.getCoverageSummary();
  },

  json() {
    return rootMap.toJSON();
  },
};
