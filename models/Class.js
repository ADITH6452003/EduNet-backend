const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subject: { type: String, trim: true },
  code: { type: String, unique: true, default: () => nanoid(7).toUpperCase() },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
