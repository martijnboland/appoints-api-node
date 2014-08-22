var Appointment = require('../models/appointment');

function mapAppointment(dbAppointment) {
  var halAppointment = {
    _links: {
      self: { href: '/appointments/' + dbAppointment.id },
      user: { href: '/users/' + dbAppointment.user.id, title: dbAppointment.user.displayName }
    },
    id: dbAppointment.id,
    title: dbAppointment.title,
    dateAndTime: dbAppointment.dateAndTime,
    endDateAndTime: dbAppointment.endDateAndTime,
    duration: dbAppointment.duration,
    remarks: dbAppointment.remarks
  };
  return halAppointment;
}

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
    res.set('Location', '/appointments/' + savedAppointment.id);
    res.send(201, mapAppointment(savedAppointment));
  });
};

exports.getById = function (req, res) {
  var appointmentId = req.params.id;
  Appointment.findById(appointmentId, function(err, dbAppointment) {
    if (err) {
      throw err;
    }
    if (dbAppointment === null) {
      res.send(404, { message: 'Appointment can not be found' });
    } 
    else {
      res.send(200, mapAppointment(dbAppointment));
    }
  });
};

exports.getByUser = function (req, res) {
  var result = {
    _links: {
      self: { href: '/appointments' }
    },
    _embedded: {
      appointment: []
    },
    count: 0
  };
  var userId = req.user.id;
  Appointment
    .find({ 'user.id': userId })
    .sort('-dateAndTime')
    .exec(function (err, appointments) {
      if (err) {
        throw err;
      }
      result.count = appointments.length;
      for (var i = 0; i < result.count; i++) {
        result._embedded.appointment.push(mapAppointment(appointments[i]));
      }
      res.send(200, result);
    });  
};

exports.update = function (req, res) {
  var appointmentId = req.params.id;
  Appointment.findById(appointmentId, function(err, dbAppointment) {
    if (err) {
      throw err;
    }
    if (dbAppointment === null) {
      res.send(404, { message: 'Appointment can not be found' });
    } 
    else {
      // maybe we should add a check for a complete object in case of a PUT request?
      dbAppointment.set(req.body) // updated object values from request body.
      dbAppointment.save(function (err, updatedDbAppointment) {
        if (err) {
          if (err.name === 'ValidationError') {
            res.send(422, err);
          }
          else {
            res.send(400, err);
          }
          return;
        }
        res.send(200, mapAppointment(updatedDbAppointment));
      })
    }
  });
};

exports.delete = function (req, res) {
  var appointmentId = req.params.id;
  Appointment.findById(appointmentId, function(err, dbAppointment) {
    if (err) {
      throw err;
    }
    if (dbAppointment === null) {
      res.send(404, { message: 'Appointment can not be found' });
    } 
    else {
      dbAppointment.remove(function (err) {
        if (err) {
          res.send(400, err);
          return;
        }
        res.send(200, { message: 'Appointment deleted' } );
      })
    }
  });
};

