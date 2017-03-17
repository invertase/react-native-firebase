export default {
  credential(token) {
    return {
      token,
      secret: '',
      provider: 'facebook',
    };
  },
};
