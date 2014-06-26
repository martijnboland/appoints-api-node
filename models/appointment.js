var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
  title: { type: String, required: 'Appointment description is required' },
  user: {
    id: { type: String, required: true },
    displayName: String
  },
  dateAndTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  remarks: String
});

module.exports = mongoose.model('Appointment', AppointmentSchema);