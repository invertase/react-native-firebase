export default {
  credential(token, secret) {
    return {
      token,
      secret,
      provider: 'twitter',
    };
  },
};
