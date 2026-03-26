const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboardStats = async (req, res) => {
  try {
    let projectMatch = {};
    if (req.user.role !== 'Admin') {
      projectMatch = { members: req.user._id };
    }

    const projects = await Project.find(projectMatch);
    const projectIds = projects.map(p => p._id);

    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({ project: { $in: projectIds }, status: 'Done' });
    const overdueTasks = await Task.countDocuments({ 
      project: { $in: projectIds }, 
      status: { $ne: 'Done' },
      deadline: { $lt: new Date() }
    });

    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const statusCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks,
      progress,
      statusCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
