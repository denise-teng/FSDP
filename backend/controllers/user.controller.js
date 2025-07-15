import User from './models/user.model.js';  // Import the User model

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
