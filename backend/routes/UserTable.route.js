import express from 'express';
import { saveUserTable, getUserTables, updateUserTable, deleteUserTable } from '../controllers/UserTable.controller.js';

const router = express.Router();

// 保存表格
router.post('/', saveUserTable);

// 获取所有表格
router.get('/', getUserTables);

// 更新表格
router.put('/:id', updateUserTable);

// 删除表格
router.delete('/:id', deleteUserTable);

export default router;
