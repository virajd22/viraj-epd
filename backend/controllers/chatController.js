const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text
    });
    
    await message.populate('sender', 'name email');
    await message.populate('receiver', 'name email');

    // Real-Time Socket Broadcast to personal room
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('receive_private_message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPrivateMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The other user the current user is chatting with
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name')
    .sort({ createdAt: 1 });

    // Optionally mark them as read when fetched
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
