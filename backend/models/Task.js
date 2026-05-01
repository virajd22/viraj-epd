const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Make this optional if a task can just belong to a group
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // NEW: Link task to a group directly
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['To Do', 'In Progress', 'In Review', 'Done', 'Rejected'], default: 'To Do' },
  deadline: { type: Date },
  tags: [{ type: String }],
  timeLogged: { type: Number, default: 0 }, // in hours
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  submissionText: { type: String },
  submissionAttachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  evaluationFeedback: { type: String },
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  history: [{
    action: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
