require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  const { name, version } = require('./../package');
  require('@google-cloud/debug-agent').start({
    allowExpressions: true,
    description: name,
    serviceContext: {
      service: name,
      version,
    },
  });
}

require('./app');
