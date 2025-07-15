import QuickMessage from '../models/QuickMessage.model.js';

export const getMessages = async (req, res) => {
  try {
    const messages = await QuickMessage.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const newMessage = new QuickMessage({ content });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add message' });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const updated = await QuickMessage.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    await QuickMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
