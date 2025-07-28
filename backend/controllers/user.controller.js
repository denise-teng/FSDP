import User from "../models/user.model.js";

// Get all users with default engagement data
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();  

    // Format the response by adding default engagement values
    const usersWithEngagementData = users.map((user, index) => ({
      index: index + 1,        // Index number (1-based)
      clientName: user.name,   // Client's name
      clicks: 0,               // Default clicks
      engagingTime: '0H0MIN',  // Default engaging time
      replies: 0,              // Default replies
    }));

    res.json(usersWithEngagementData);  // Send the formatted data
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
// controllers/user.controller.js
export const getRawUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role'); // Only get what you need
    res.json(users);
  } catch (error) {
    console.error('Error fetching raw users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const toggleUserRole = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Toggle between 'admin' and 'customer'
    user.role = user.role === 'admin' ? 'customer' : 'admin';
    await user.save();

    res.status(200).json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};