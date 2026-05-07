import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date },
  location: { type: String },
  maxParticipants: { type: Number, default: 0 },
  maxTeamSize: { type: Number, default: 1 },
  organizerName: { type: String },
  organizerPhone: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export const Event = mongoose.model('Event', eventSchema);
