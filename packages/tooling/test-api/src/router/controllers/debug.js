if (__DEV__) {
  module.exports = {
    'get /debug/error': () => {
      throw new Error('Some Error');
    },
    'get /debug/404': (req, res) => res.notFound(),
    'get /debug/400': (req, res) => res.badRequest(),
    'get /debug/500': (req, res) => res.serverError(),
  };
} else {
  module.exports = {};
}
