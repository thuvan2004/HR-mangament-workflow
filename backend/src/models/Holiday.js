const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a holiday name'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide the holiday date'],
  },
  type: {
    type: String,
    enum: ['Public Holiday', 'Company Holiday', 'Optional Holiday'],
    default: 'Public Holiday',
  },
  description: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Holiday', HolidaySchema);
