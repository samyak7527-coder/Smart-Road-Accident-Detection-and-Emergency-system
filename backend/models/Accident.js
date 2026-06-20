const mongoose = require('mongoose');

const AccidentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  alertStatus: {
    type: String,
    enum: ['Pending', 'Sent', 'Cancelled'],
    default: 'Pending'
  },
  notifiedContacts: [{
    name: String,
    mobileNumber: String,
    notifiedVia: [String], // 'email', 'sms', 'whatsapp'
    status: {
      type: String,
      default: 'Sent'
    }
  }],
  notifiedHospitals: [{
    name: String,
    distance: Number,
    address: String,
    contactNumber: String,
    status: {
      type: String,
      default: 'Sent'
    }
  }],
  logs: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'system']
    },
    recipient: String,
    message: String,
    status: {
      type: String,
      enum: ['success', 'simulated', 'failed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Accident', AccidentSchema);
