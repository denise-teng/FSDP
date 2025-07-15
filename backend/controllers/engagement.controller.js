import Engagement from '../models/engagement.model.js';

export const logEngagement = async (req, res) => {
  try {
    const { engagementType, clicks = 0, engagingTime = 0, replies = 0 } = req.body;
    const userId = req.userId;        // Make sure auth middleware sets this
    const userType = req.userRole;    // Optional: from auth middleware or client

    // 如果 userId 或 engagementType 没有提供，则返回 400 错误，提示缺少必要字段。
    if (!userId || !engagementType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 查找或创建 Engagement 文档，更新点击数、参与时间和回复数。
    // 更新或插入用户参与数据
    const updatedEngagement = await Engagement.findOneAndUpdate(
      { userId, engagementType },
      {
        $inc: { clicks, engagingTime, replies },
        $setOnInsert: { userType, timeline: { start: new Date(), end: new Date() } }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updatedEngagement);
  } catch (error) {
    // 如果在上述过程中发生错误（如数据库错误），会捕获错误并打印错误信息。
    console.error('Error tracking engagement:', error);
    res.status(500).json({ error: 'Failed to track engagement' });
  }
};


// 目的：此函数用于处理用户参与记录的数据（如点击量、回复数等）。它可以更新已有记录，也可以插入新的记录。

// 更新方式：通过 findOneAndUpdate 方法进行更新或插入，使用 $inc 增加参与数据，使用 $setOnInsert 插入新记录时的默认值。

// 错误处理：如果用户 ID 或参与类型缺失，返回 400 错误；如果发生其他错误，返回 500 错误。