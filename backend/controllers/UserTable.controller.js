import UserTable from '../models/UserTable.model.js';

// 保存新的自定义表格
export const saveUserTable = async (req, res) => {
  const { title, data } = req.body;
  
  try {
    const newTable = new UserTable({ title, data });
    await newTable.save();
    res.status(201).json(newTable);
  } catch (err) {
    console.error('Error saving table:', err);
    res.status(500).json({ error: 'Failed to save table' });
  }
};

// 查询所有已保存的自定义表格
export const getUserTables = async (req, res) => {
  try {
    const tables = await UserTable.find();
    res.json(tables);
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
};

// 更新表格
export const updateUserTable = async (req, res) => {
  const { id } = req.params;
  const { title, data } = req.body;

  try {
    const updatedTable = await UserTable.findByIdAndUpdate(id, { title, data }, { new: true });
    res.json(updatedTable);
  } catch (err) {
    console.error('Error updating table:', err);
    res.status(500).json({ error: 'Failed to update table' });
  }
};

// 删除表格
export const deleteUserTable = async (req, res) => {
  const { id } = req.params;

  try {
    await UserTable.findByIdAndDelete(id);
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    console.error('Error deleting table:', err);
    res.status(500).json({ error: 'Failed to delete table' });
  }
};
