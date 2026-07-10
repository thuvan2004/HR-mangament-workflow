const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
  },
  type: {
    type: String,
    enum: ['Leave', 'Expense', 'Asset', 'HRRequest', 'General', 'System'],
    default: 'General',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', NotificationSchema);
