module.exports = {
  redis: {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: Number.parseInt(process.env.REDIS_PORT, 10),
  },
};
