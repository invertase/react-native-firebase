// use the package name as the log prefix - for easier distinction between logs
const { name: label } = require('./../../package.json');

module.exports.log = {
  label,
  colorize: __DEV__,
  prettyPrint: __DEV__,
  level: __DEV__ ? 'verbose' : 'info',
  humanReadableUnhandledException: __DEV__,
  // in prod we use json output to allow log ingestion services to parse logs e.g. stackdriver
  json: !__DEV__,
};
