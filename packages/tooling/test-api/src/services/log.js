const { createLogger, format, transports } = require('winston');

const { combine, label, json, prettyPrint, colorize, printf } = format;

const formats = [];
const config = { ...require('./../config').log };

if (config.json) {
  formats.push(json());
  formats.push(printf(info => JSON.stringify(info)));
} else {
  if (config.label) formats.push(label({ label: config.label }));
  if (config.colorize) formats.push(colorize());
  if (config.prettyPrint) formats.push(prettyPrint());
  formats.push(printf(info => `[${info.label}] ${info.level}: ${info.message}`));
}

let instance = createLogger({
  format: combine(...formats),
  transports: [new transports.Console(config)],
});

module.exports = {
  name: 'log',

  get instance() {
    return instance;
  },

  initialize() {
    if (global.Log) return module.exports;

    if (!instance) {
      instance = createLogger({
        format: combine(...formats),
        transports: [new transports.Console()],
      });
    }

    global.Log = instance;
    return module.exports;
  },

  destroy() {
    if (instance) {
      instance = null;
      delete global.Log;
    }
  },
};
