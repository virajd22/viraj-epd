const Project = require('../models/Project');
const Group = require('../models/Group');
const Task = require('../models/Task');

exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline, members, assignedGroups } = req.body;
    
    const project = await Project.create({
      name,
      description,
      deadline,
      createdBy: req.user._id,
      members: members || [],
      assignedGroups: assignedGroups || []
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('members', 'name email').populate('createdBy', 'name').populate('assignedGroups', 'name');
    } else {
      // Find groups the user belongs to
      const userGroups = await Group.find({ members: req.user._id }).select('_id');
      const groupIds = userGroups.map(g => g._id);

      projects = await Project.find({
        $or: [
           { members: req.user._id },
           { assignedGroups: { $in: groupIds } }
        ]
      }).populate('members', 'name email').populate('createdBy', 'name').populate('assignedGroups', 'name');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name')
      .populate('assignedGroups', 'name');
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin') {
      const isDirectMember = project.members.some(m => m._id.toString() === req.user._id.toString());
      if (!isDirectMember) {
         // Check if they are in any assigned group
         const userGroups = await Group.find({ members: req.user._id }).select('_id');
         const groupIds = userGroups.map(g => g._id.toString());
         const isGroupMember = project.assignedGroups.some(ag => groupIds.includes(ag._id.toString()));

         if (!isGroupMember) {
           return res.status(403).json({ message: 'Not authorized to view this project' });
         }
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectProgress = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('assignedGroups');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // For each assigned group, find total tasks bounded to this project and this group
    const progressData = [];
    for (const group of project.assignedGroups) {
      const tasks = await Task.find({ project: project._id, group: group._id });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Done').length;
      const inReviewTasks = tasks.filter(t => t.status === 'In Review').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      progressData.push({
        group: { _id: group._id, name: group.name },
        totalTasks,
        completedTasks,
        inReviewTasks,
        progress
      });
    }

    res.json(progressData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
