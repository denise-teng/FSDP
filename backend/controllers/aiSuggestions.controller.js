import { generateAdminRecommendations } from '../lib/aiSuggestions.js';
import Engagement from '../models/engagement.model.js';

export const getEngagementRecommendations = async (req, res) => {
    try {
        // Fetch engagement data
        const engagementData = await Engagement.aggregate([
            { $match: { 'userType': 'customer' } },  // Only include customers
            {
                $group: {
                    _id: null,  // No grouping by userId
                    totalClicks: { $sum: '$clicks' },
                    totalEngagingTime: { $sum: '$engagingTime' },
                    totalReplies: { $sum: '$replies' },
                    totalUsers: { $sum: 1 }
                }
            }
        ]);

        // Log engagement data to check the structure
        console.log('Full Engagement Data:', engagementData);

        // Ensure engagement data is not empty
        if (!engagementData || engagementData.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No engagement data available for recommendations'
            });
        }

        // Calculate averages
        const avgClicks = engagementData[0].totalClicks / engagementData[0].totalUsers;
        const avgEngagingTime = engagementData[0].totalEngagingTime / engagementData[0].totalUsers;
        const avgReplies = engagementData[0].totalReplies / engagementData[0].totalUsers;

        // Log the calculated averages
        console.log('Calculated Averages:', {
            avgClicks,
            avgEngagingTime,
            avgReplies
        });

        // Pass data to AI model to generate recommendations
        const recommendations = await generateAdminRecommendations(
            avgClicks, avgEngagingTime, avgReplies
        );

        // Log the recommendations
        console.log('Generated Recommendations:', recommendations);

        res.status(200).json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations'
        });
    }
};

