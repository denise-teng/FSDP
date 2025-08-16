// At the top of the file
import Engagement from '../models/engagement.model.js';
import User from '../models/user.model.js';

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

export const getUserActivityAnalysis = async (req, res) => {
    try {
        // Calculate activity score function (stricter standards)
        const calculateActivityScore = (clicks, engagingTime, replies) => {
            // Adjust weight distribution: browsing time is more important, 50%
            const clickWeight = 0.25;    // Click weight: 25%
            const timeWeight = 0.5;      // Browse time weight: 50%
            const replyWeight = 0.25;    // Reply weight: 25%
            
            // Ensure input values are numbers
            const safeClicks = Number(clicks) || 0;
            const safeTime = Number(engagingTime) || 0;
            const safeReplies = Number(replies) || 0;
            
            // Stricter full score standards
            const normalizedClicks = Math.min((safeClicks / 30) * 100, 100);   // Need 30 clicks for full score
            const normalizedTime = Math.min((safeTime / 1200) * 100, 100);     // Need 20 minutes browse time for full score  
            const normalizedReplies = Math.min((safeReplies / 8) * 100, 100);  // Need 8 replies for full score
            
            // Use non-linear calculation to make high scores harder to achieve
            const poweredClicks = Math.pow(normalizedClicks / 100, 1.2) * 100;
            const poweredTime = Math.pow(normalizedTime / 100, 1.3) * 100;      // Browse time uses stricter exponent
            const poweredReplies = Math.pow(normalizedReplies / 100, 1.1) * 100;
            
            const finalScore = (poweredClicks * clickWeight + poweredTime * timeWeight + poweredReplies * replyWeight);
            
            console.log(`=== Strict Standard User Score Calculation ===`);
            console.log(`Raw data: clicks=${safeClicks}, time=${safeTime}s(${(safeTime/60).toFixed(1)}min), replies=${safeReplies}`);
            console.log(`Linear normalization: clicks=${normalizedClicks.toFixed(1)}, time=${normalizedTime.toFixed(1)}, replies=${normalizedReplies.toFixed(1)}`);
            console.log(`Non-linear adjustment: clicks=${poweredClicks.toFixed(1)}, time=${poweredTime.toFixed(1)}, replies=${poweredReplies.toFixed(1)}`);
            console.log(`Weight distribution: clicks ${clickWeight*100}% + time ${timeWeight*100}% + replies ${replyWeight*100}%`);
            console.log(`Final score: ${finalScore.toFixed(1)}`);
            console.log(`===============================================`);
            
            return finalScore;
        };

        // Classify users based on activity score (merged inactive and silent users, raised churn threshold)
        const classifyUser = (score) => {
            console.log(`\n--- Starting user classification, score: ${score} ---`);
            
            let result;
            if (score >= 80) {
                result = { type: 'Highly Active', color: '#10B981', bgColor: '#D1FAE5' }; // Green - Highly Active (80+ points)
                console.log(`Classified as: Highly Active (>= 80 points) - Very few users can achieve this`);
            } else if (score >= 60) {
                result = { type: 'Active', color: '#059669', bgColor: '#ECFDF5' };      // Dark Green - Active (60-79 points)
                console.log(`Classified as: Active (60-79 points) - Requires long browsing time`);
            } else if (score >= 40) {
                result = { type: 'Regular', color: '#3B82F6', bgColor: '#DBEAFE' };      // Blue - Regular (40-59 points)
                console.log(`Classified as: Regular (40-59 points) - Some level of engagement`);
            } else if (score >= 15) {
                result = { type: 'Silent', color: '#F59E0B', bgColor: '#FEF3C7' };      // Orange - Silent (15-39 points, merged inactive)
                console.log(`Classified as: Silent (15-39 points) - Low engagement, needs attention`);
            } else {
                result = { type: 'Churned', color: '#DC2626', bgColor: '#FEE2E2' };       // Red - Churned (0-14 points, raised threshold)
                console.log(`Classified as: Churned (< 15 points) - Needs reactivation`);
            }
            
            console.log(`Classification result:`, result);
            console.log(`--- Classification complete ---\n`);
            return result;
        };

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
            {
                $group: {
                    _id: '$user._id',
                    name: { $first: '$user.name' },
                    email: { $first: '$user.email' },
                    userType: { $first: '$user.role' },
                    clicks: { $sum: '$clicks' },
                    engagingTime: { $sum: '$engagingTime' },
                    replies: { $sum: '$replies' },
                    lastActivity: { $max: '$createdAt' }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    userType: 1,
                    clicks: 1,
                    engagingTime: 1,
                    replies: 1,
                    lastActivity: 1
                }
            }
        ]);

        // Process data and calculate activity scores
        const processedData = data.map(user => {
            console.log(`\n=== Processing user: ${user.name} ===`);
            console.log(`Raw user data:`, user);
            
            const activityScore = calculateActivityScore(user.clicks, user.engagingTime, user.replies);
            const classification = classifyUser(activityScore);
            
            console.log(`Processing result: score=${activityScore}, classification=${classification.type}, color=${classification.color}, bgColor=${classification.bgColor}`);
            
            const result = {
                ...user,
                activityScore: Math.round(activityScore * 10) / 10, // Keep one decimal place
                userClassification: classification.type,
                classificationColor: classification.color,
                classificationBgColor: classification.bgColor,
                daysSinceLastActivity: user.lastActivity ? 
                    Math.floor((new Date() - new Date(user.lastActivity)) / (1000 * 60 * 60 * 24)) : null
            };
            
            console.log(`Final return data:`, result);
            
            return result;
        });

        // Sort by activity score
        processedData.sort((a, b) => b.activityScore - a.activityScore);

        res.status(200).json(processedData);
    } catch (err) {
        console.error('Error fetching user activity analysis:', err);
        res.status(500).json({ error: 'Failed to fetch user activity data' });
    }
};
