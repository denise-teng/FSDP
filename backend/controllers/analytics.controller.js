// At the top of the file
import Engagement from '../models/engagement.model.js';

export const getClientEngagementStats = async (req, res) => {
    try {
        const data = await Engagement.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $match: { 'user.role': { $in: ['customer', 'admin'] } } },
            {
                $group: {
                    _id: '$user._id',
                    name: { $first: '$user.name' },
                    userType: { $first: '$user.role' }, // << add this line
                    clicks: { $sum: '$clicks' },
                    engagingTime: { $sum: '$engagingTime' },
                    replies: { $sum: '$replies' },
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    userType: 1,
                    clicks: 1,
                    engagingTime: 1,
                    replies: 1
                }
            }
        ]);


        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching client engagement stats:', err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};
