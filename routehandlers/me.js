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
  res.send(200, result);
}