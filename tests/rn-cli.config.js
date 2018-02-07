const blacklist = require('metro/src/blacklist');

module.exports = {
  getBlacklistRE() {
    return blacklist([/react-native\/local-cli\/core\/__fixtures__.*/]);
  },
};
