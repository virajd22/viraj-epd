const Comment = require('../models/Comment');
const Announcement = require('../models/Announcement');

exports.addComment = async (req, res) => {
  try {
    const { taskId, projectId, text } = req.body;
    const comment = await Comment.create({
      task: taskId,
      project: projectId,
      user: req.user._id,
      text
    });
    
    await comment.populate('user', 'name email');
    
    // Real-Time Socket Broadcast
    if (projectId) {
      const io = req.app.get('io');
      if (io) {
        io.to(projectId.toString()).emit('receive_message', comment);
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { taskId, projectId } = req.query;
    let query = {};
    if (taskId) query.task = taskId;
    if (projectId) query.project = projectId;

    const comments = await Comment.find(query).populate('user', 'name').sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      author: req.user._id
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
