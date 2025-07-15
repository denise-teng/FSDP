import mongoose from 'mongoose';

const UserTableSchema = new mongoose.Schema({
  title: { type: String, required: true },  // 表格名称
  data: { type: Array, required: true },    // 表格的数据内容
  createdAt: { type: Date, default: Date.now },  // 创建时间
});

export default mongoose.model('UserTable', UserTableSchema);
