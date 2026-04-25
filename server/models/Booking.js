const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  studentName: String,
  roomNumber: String,
  checkInDate: Date,
  checkOutDate: Date,
});

module.exports = mongoose.model('Booking', BookingSchema);
