module.exports.redis = {
  clientConfig: {
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || undefined,
    port: Number.parseInt(process.env.REDIS_PORT || 6379, 10),
  }
};
