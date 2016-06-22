module.exports = function (req, res) {
  var user = req.user;
  var result = {
    _links: {
      self: { href: '/users/' + user.id }
    },
    userId: user.userId,
    provider: user.provider,
    email: user.email,
    displayName: user.displayName,
    roles: user.roles
  };
  res.status(200).send(result);
}