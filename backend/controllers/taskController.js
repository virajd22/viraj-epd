const Task = require('../models/Task');
const Group = require('../models/Group');

exports.createTask = async (req, res) => {
  try {
    const { title, description, project, group, assignee, priority, deadline, tags } = req.body;
    
    const history = [{ action: 'Task Created' }];

    const task = await Task.create({
      title, description, project, group, assignee, priority, deadline, tags, history
    });

    if (group) {
        await Group.findByIdAndUpdate(group, { $push: { tasks: task._id } });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('group', 'name')
      .populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasksByGroup = async (req, res) => {
  try {
    const tasks = await Task.find({ group: req.params.groupId })
      .populate('assignee', 'name email')
      .populate('group', 'name')
      .populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('group', 'name')
      .populate('project', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { status, assignee, timeLogged, actionMessage, ...otherUpdates } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (actionMessage) {
       task.history.push({ action: actionMessage });
    } else if (status && status !== task.status) {
       task.history.push({ action: `Status changed to ${status}` });
       task.status = status;
    }
    
    if (assignee && assignee !== task.assignee?.toString()) {
        task.assignee = assignee;
        task.history.push({ action: 'Assignee changed' });
    }
    
    if (timeLogged) task.timeLogged += Number(timeLogged);
    
    Object.assign(task, otherUpdates);

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
