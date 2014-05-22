var Appointment = require('../models/appointment');

exports.create = function (req, res) {
  var newAppointment = new Appointment(req.body);
  newAppointment.user.id = req.user.id;
  newAppointment.user.displayName = req.user.displayName;
  newAppointment.save(function (err, savedAppointment) {
    if (err) {
      if (err.name === 'ValidationError') {
        res.send(422, err);
      }
      else {
        res.send(400, err);
      }
      return;
    }
    var appointmentUrl = '/appointments/' + savedAppointment.id;
    res.set('Location', appointmentUrl);
    var result = {
      _links: {
        self: { href: appointmentUrl },
        user: { href: '/users/' + savedAppointment.user.id, title: savedAppointment.user.displayName }
      },
      title: savedAppointment.title,
      dateAndTime: savedAppointment.dateAndTime,
      duration: savedAppointment.duration,
      remarks: savedAppointment.remarks
    };
    res.send(201, result);
  });
};

exports.getById = function (req, res) {

};

exports.getByUserId = function (req, res) {

};

exports.update = function (req, res) {

};

exports.delete = function (req, res) {

};
