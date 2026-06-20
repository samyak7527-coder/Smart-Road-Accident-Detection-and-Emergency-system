const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // Array of emergency contacts – supports multiple entries
    emergencyContacts: [
      {
        name: { type: String, required: true, trim: true },
        relationship: { type: String, required: true, trim: true },
        mobileNumber: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true }
      }
    ]
  },
  { timestamps: true }
);

// Virtual field for backward compatibility – returns the first contact if any
UserSchema.virtual('primaryContact').get(function () {
  return this.emergencyContacts && this.emergencyContacts.length > 0 ? this.emergencyContacts[0] : null;
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
