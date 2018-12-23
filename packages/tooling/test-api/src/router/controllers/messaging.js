// https://firebase.google.com/docs/cloud-messaging/admin/
module.exports = {
  'post /messaging/send': (req, res) => {
    const { token, topic, data } = req.body;
    // admin.messaging().send({ token, topic, data });
    res.ok({});
  },

  'post /messaging/topic/subscribe': (req, res) => {
    const { token, topic } = req.body;
    // admin.messaging().subscribeToTopic([token], topic);
    res.ok({});
  },


  'post /messaging/topic/unsubscribe': (req, res) => {
    const { token, topic } = req.body;
    // admin.messaging().unsubscribeFromTopic([token], topic);
    res.ok({});
  },
};
