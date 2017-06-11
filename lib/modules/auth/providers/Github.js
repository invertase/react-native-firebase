export default {
  credential(token) {
    return {
      token,
      secret: '',
      provider: 'github',
      providerId: 'github',
    };
  },
};
