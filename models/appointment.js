var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
  title: { type: String, required: 'Appointment description is required' },
  user: {
    id: { type: String, required: true },
    displayName: String
  },
  dateAndTime: { type: Date, required: true },
  endDateAndTime: { type: Date, required: true },
  remarks: String
});

AppointmentSchema.virtual('duration')
  .get(function () {
    var durationMs = this.endDateAndTime - this.dateAndTime;
    if (durationMs) {
      return Math.abs(this.endDateAndTime - this.dateAndTime) / 1000 / 60;
    }
    else {
      return;
    }
  });

AppointmentSchema.path('dateAndTime').validate({
  validator: function (value) {
    var self = this;
    return new Promise(function(resolve, reject) {
      mongoose.models.Appointment.find( { 
        '_id': { $ne: self._id },
        'user.id': self.user.id,
        $or: [ 
          { dateAndTime: { $lt: self.endDateAndTime, $gte: self.dateAndTime } }, 
          { endDateAndTime: { $lte: self.endDateAndTime, $gt: self.dateAndTime } }
        ] 
      }, function (err, appointments) {
        resolve(! appointments || appointments.length === 0);
      });  
    })
  },
  message: "The appointment overlaps with other appointments"
});

AppointmentSchema.path('dateAndTime').validate(function (value) {
  var isValid = true;
  if (value < new Date()) {
    isValid = false;
  }
  return isValid;
}, "The appointment can not be scheduled in the past");


module.exports = mongoose.model('Appointment', AppointmentSchema);