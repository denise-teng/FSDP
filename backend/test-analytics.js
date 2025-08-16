import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import analyticsRoutes from './routes/analytics.route.js';

const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 数据库连接
mongoose.connect('mongodb://localhost:27017/full_stack_project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB 连接成功');
}).catch((error) => {
    console.error('MongoDB 连接失败:', error);
});

// 使用路由
app.use('/analytics', analyticsRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`测试服务器运行在端口 ${PORT}`);
    console.log(`前端可以通过 http://localhost:${PORT}/analytics/user-activity-analysis 访问新的活跃分数计算`);
});
