export default {
  credential(email, password) {
    return {
      token: email,
      secret: password,
      provider: 'password',
      providerId: 'password',
    };
  },
};
