// https://firebase.google.com/docs/auth/admin/
// https://firebase.google.com/docs/auth/admin/manage-users

module.exports = {
  // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
  'post /auth/user': (req, res) => {
    // TODO validation
    // admin.auth().createUser({
    //   email: "user@example.com",
    //   emailVerified: false,
    //   phoneNumber: "+11234567890",
    //   password: "secretPassword",
    //   displayName: "John Doe",
    //   photoURL: "http://www.example.com/12345678/photo.png",
    //   disabled: false
    // })
    res.ok({});
  },

  // https://firebase.google.com/docs/auth/admin/manage-users#retrieve_user_data
  'get /auth/user/:uid': (req, res) => {
    // TODO validation
    // admin.auth().getUser(uid);
    res.ok(req.params.uid);
  },

  // https://firebase.google.com/docs/auth/admin/manage-users#update_a_user
  'patch /auth/user/:uid': (req, res) => {
    // TODO validation
    // admin.auth().updateUser(uid, {});
    res.ok(req.params.uid);
  },

  // https://firebase.google.com/docs/auth/admin/manage-users#delete_a_user
  'delete /auth/user/:uid': (req, res) => {
    // TODO validation
    // admin.auth().deleteUser(uid);
    res.ok(req.params.uid);
  },

  // https://firebase.google.com/docs/auth/admin/create-custom-tokens
  'post /auth/user/:uid:/token': (req, res) => {
    // TODO validation
    // admin.auth().createCustomToken(uid, req.body.claims);
    res.ok({ uid: req.params.uid, claims: req.body.claims });
  },
};
