const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  universityOrRole: { type: String, default: '' },
  phone: { type: String, default: '' },
  photoURL: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

module.exports = mongoose.model('Member', memberSchema);
