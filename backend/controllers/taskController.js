const Task = require('../models/Task');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

exports.createTask = async (req, res) => {
  try {
    const { title, description, project, group, assignee, priority, deadline, tags } = req.body;
    
    const history = [{ action: 'Task Created' }];

    const task = await Task.create({
      title, description, project, group, assignee, priority, deadline, tags, history
    });

    if (group) {
        const groupDoc = await Group.findByIdAndUpdate(group, { $push: { tasks: task._id } });
        if (groupDoc) {
          const membersToNotify = [...new Set([...groupDoc.members.map(m=>m.toString()), groupDoc.admin.toString()])];
          const notifications = membersToNotify.map(userId => ({
            user: userId,
            message: `New task assigned to your group: ${task.title}`,
            actionText: 'View Task',
            actionUrl: '/tasks',
            type: 'TaskAssigned',
            relatedTask: task._id
          }));
          await Notification.insertMany(notifications);
        }
    } else if (assignee) {
        await Notification.create({
          user: assignee,
          message: `You have been assigned a new task: ${task.title}`,
          actionText: 'View Task',
          actionUrl: '/tasks',
          type: 'TaskAssigned',
          relatedTask: task._id
        });
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

exports.submitTask = async (req, res) => {
  try {
    const { submissionText, submissionAttachments } = req.body;
    const task = await Task.findById(req.params.id).populate('group');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = 'In Review';
    task.submissionText = submissionText;
    if (submissionAttachments) task.submissionAttachments = submissionAttachments;
    task.submittedBy = req.user._id;
    task.history.push({ action: 'Task submitted for review' });

    await task.save();

    if (task.group) {
       await Notification.create({
         user: task.group.admin,
         message: `Task submitted for review: ${task.title}`,
         actionText: 'Evaluate Task',
         actionUrl: '/tasks',
         type: 'TaskSubmitted',
         relatedTask: task._id
       });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.evaluateTask = async (req, res) => {
  try {
    const { status, evaluationFeedback } = req.body; // status: 'Done' or 'Rejected'
    const task = await Task.findById(req.params.id).populate('group');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    task.evaluationFeedback = evaluationFeedback;
    task.evaluatedBy = req.user._id;
    task.history.push({ action: `Task evaluated: ${status}` });

    await task.save();

    const notifyUsers = [];
    if (task.submittedBy) notifyUsers.push(task.submittedBy.toString());
    if (task.assignee) notifyUsers.push(task.assignee.toString());
    
    const uniqueUsers = [...new Set(notifyUsers)];

    const notifications = uniqueUsers.map(userId => ({
         user: userId,
         message: `Your task submission for "${task.title}" was ${status === 'Done' ? 'Accepted' : 'Rejected'}`,
         actionText: 'View Evaluation',
         actionUrl: '/tasks',
         type: 'TaskEvaluated',
         relatedTask: task._id
    }));
    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
