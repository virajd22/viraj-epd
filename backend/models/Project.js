const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' },
  grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'Pending'], default: 'Pending' },
  facultyFeedback: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
