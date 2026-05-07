import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  year: { type: String },
  department: { type: String },
  phoneNumber: { type: String },
  teamName: { type: String },
  teamMembers: [{
    name: String,
    email: String
  }],
  attended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Registration = mongoose.model('Registration', registrationSchema);
