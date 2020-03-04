const { name } = require('../../package.json');

const ConfigStore = require('configstore');

module.exports = new ConfigStore(name);
