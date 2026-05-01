const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Generate 6-char random code
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const group = await Group.create({
      name,
      joinCode,
      admin: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const group = await Group.findOne({ joinCode: joinCode.toUpperCase() });
    
    if (!group) return res.status(404).json({ message: 'Invalid group code' });

    if (!group.members.includes(req.user._id)) {
      group.members.push(req.user._id);
      await group.save();
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    let groups;
    if (req.user.role === 'Admin') {
      groups = await Group.find().populate('members', 'name email').populate('admin', 'name email');
    } else {
      groups = await Group.find({ members: req.user._id }).populate('members', 'name email').populate('admin', 'name email');
    }
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('admin', 'name email')
      .populate('tasks', 'title status deadline');
      
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
