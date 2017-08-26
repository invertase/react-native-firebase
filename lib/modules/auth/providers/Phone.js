export default {
  credential(verificationId, code) {
    return {
      token: verificationId,
      secret: code,
      provider: 'phone',
      providerId: 'phone',
    };
  },
};
