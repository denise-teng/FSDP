import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Save, 
  Edit, 
  Trash2, 
  Plus, 
  TrendingUp, 
  Users, 
  Clock,
  Filter,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsTab() {
  const [filters, setFilters] = useState({
    title: '',
    userType: '',
    metric: 'clicks',
  });

  const [selectedColumns, setSelectedColumns] = useState({
    clicks: true,
    engagingTime: true,
    replies: true,
  });

  const [savedTables, setSavedTables] = useState(() => {
    const saved = localStorage.getItem('savedAnalyticsTables');
    return saved ? JSON.parse(saved) : [];
  });

  const [tableName, setTableName] = useState('');
  const [sorting, setSorting] = useState('clicks');
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [data, setData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [activityFilter, setActivityFilter] = useState('All'); // New filter state
  const [recommendations, setRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [charts, setCharts] = useState([]);
  const [showChartModal, setShowChartModal] = useState(false);
  const [newChartConfig, setNewChartConfig] = useState({
    title: '',
    type: 'line',
    metric: 'clicks',
    timeRange: 'monthly'
  });

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number') return '-';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  // Filter function for user activity data
  const getFilteredUserActivityData = () => {
    if (activityFilter === 'All') {
      return userActivityData;
    }
    return userActivityData.filter(user => user.userClassification === activityFilter);
  };

  useEffect(() => {
    localStorage.setItem('savedAnalyticsTables', JSON.stringify(savedTables));
  }, [savedTables]);

  useEffect(() => {
    fetchData();
    fetchRecommendations();
    fetchUserActivityData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/analytics/client-engagements');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load engagement data');
    }
  };

  const fetchUserActivityData = async () => {
    try {
      const res = await axios.get('/analytics/user-activity-analysis');
      setUserActivityData(res.data);
    } catch (err) {
      console.error('Error fetching user activity data:', err);
      toast.error('Failed to load user activity data');
    }
  };

  const fetchRecommendations = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.get('/analytics/engagement-recommendations');
      console.log('Recommendations fetched:', res.data);
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err.response || err);
      toast.error('Failed to load recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFilteredSortedData = () => {
    let filtered = [...data];
    if (filters.userType) {
      filtered = filtered.filter(entry => entry.userType === filters.userType);
    }
    return filtered.sort((a, b) => b[sorting] - a[sorting]);
  };

  const saveTable = () => {
    if (!tableName) return;
    const rawData = getFilteredSortedData();
    const newTable = {
      title: tableName,
      config: {
        selectedColumns,
        filters,
        sorting,
      },
      data: rawData,
    };
    setSavedTables(prev =>
      editing
        ? prev.map(t => (t.title === editing.title ? newTable : t))
        : [...prev, newTable]
    );
    setEditing(null);
    setShowEdit(false);
    setTableName('');
  };

  const deleteTable = (tableTitle) => {
    setSavedTables(savedTables.filter(t => t.title !== tableTitle));
    if (editing?.title === tableTitle) {
      setEditing(null);
      setShowEdit(false);
      setTableName('');
    }
  };

  const updateTable = (tableTitle) => {
    const target = savedTables.find(t => t.title === tableTitle);
    if (!target) return;
    setTableName(target.title);
    setSelectedColumns(target.config.selectedColumns);
    setFilters(target.config.filters);
    setSorting(target.config.sorting);
    setEditing(target);
    setShowEdit(true);
  };

  const exportToExcel = (tableTitle, tableData, tableConfig) => {
    if (!tableData || tableData.length === 0) {
      toast.error('No data available to export');
      return;
    }

    const selectedCols = tableConfig?.selectedColumns || selectedColumns;

    const exportData = tableData.map((entry, i) => {
      const row = {
        No: i + 1,
        Name: entry.name,
      };
      if (selectedCols.clicks) row.Clicks = entry.clicks;
      if (selectedCols.engagingTime) {
        const sec = entry.engagingTime;
        row['Engaging Time'] = typeof sec === 'number'
          ? `${Math.floor(sec / 60)}m ${sec % 60}s`
          : '-';
      }
      if (selectedCols.replies) row.Replies = entry.replies;
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data_blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data_blob, `${tableTitle || 'analytics'}.xlsx`);
    toast.success('Excel file exported successfully!');
  };

  const exportUserActivityToExcel = () => {
    const filteredData = getFilteredUserActivityData();
    if (!filteredData || filteredData.length === 0) {
      toast.error('No user activity data available to export');
      return;
    }

    const exportData = filteredData.map((user, i) => ({
      'No.': i + 1,
      'Username': user.name,
      'Email': user.email,
      'User Type': user.userType === 'customer' ? 'Customer' : 'Admin',
      'Clicks': user.clicks,
      'Browse Time (seconds)': user.engagingTime,
      'Replies': user.replies,
      'Activity Score': user.activityScore,
      'Classification': user.userClassification,
      'Last Active': user.daysSinceLastActivity ? `${user.daysSinceLastActivity} days ago` : 'Never active'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Activity Analysis');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data_blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data_blob, 'User_Activity_Analysis.xlsx');
    toast.success('User activity analysis exported successfully!');
  };

  const createNewChart = () => {
    if (!newChartConfig.title) {
      toast.error('Please enter a chart title');
      return;
    }

    const chartData = {
      labels: data.map(entry => entry.name),
      datasets: [{
        label: newChartConfig.metric === 'clicks' ? 'Clicks' : 
               newChartConfig.metric === 'engagingTime' ? 'Engaging Time (seconds)' : 'Replies',
        data: data.map(entry => entry[newChartConfig.metric] || 0),
        backgroundColor: newChartConfig.type === 'pie' 
          ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
          : 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    };

    const newChart = {
      id: Date.now(),
      title: newChartConfig.title,
      type: newChartConfig.type,
      data: chartData
    };

    setCharts(prev => [...prev, newChart]);
    setShowChartModal(false);
    setNewChartConfig({ title: '', type: 'line', metric: 'clicks', timeRange: 'monthly' });
    toast.success('Chart created successfully!');
  };

  const deleteChart = (chartId) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
    toast.success('Chart deleted successfully!');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="pt-8 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
              
              <div className="relative flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Analytics Dashboard
                    </span>
                  </h1>
                  <p className="text-gray-600 text-lg">Monitor engagement metrics and user behavior</p>
                </div>
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">{data.reduce((sum, user) => sum + (user.clicks || 0), 0)}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg. Engagement</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatTime(Math.round(data.reduce((sum, user) => sum + (user.engagingTime || 0), 0) / Math.max(data.length, 1)))}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dynamic Charts Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Charts</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChartModal(true)}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  Create Chart
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {charts.map(chart => (
                  <motion.div 
                    key={chart.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                      <button
                        onClick={() => deleteChart(chart.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="w-full h-64">
                      {chart.type === 'line' && <Line data={chart.data} options={chartOptions} />}
                      {chart.type === 'bar' && <Bar data={chart.data} options={barChartOptions} />}
                      {chart.type === 'pie' && <Pie data={chart.data} options={pieChartOptions} />}
                    </div>
                  </motion.div>
                ))}
              </div>

              {charts.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No charts created yet</p>
                  <p className="text-gray-400">Click "Create Chart" to get started</p>
                </div>
              )}
            </motion.div>

            {/* Data Table Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Engagement Data</h2>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition-all duration-300"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Refresh
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => exportToExcel(tableName, getFilteredSortedData(), { selectedColumns, filters, sorting })}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition-all duration-300"
                  >
                    <Download className="h-5 w-5" />
                    Export
                  </motion.button>
                </div>
              </div>

              {/* Filters and Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">User Type</label>
                  <select
                    value={filters.userType}
                    onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">All Types</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Sort By</label>
                  <select
                    value={sorting}
                    onChange={(e) => setSorting(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  >
                    <option value="clicks">Clicks</option>
                    <option value="engagingTime">Engaging Time</option>
                    <option value="replies">Replies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Table Name</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Enter table name"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Actions</label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveTable}
                    disabled={!tableName}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <Save className="h-5 w-5" />
                    {editing ? 'Update' : 'Save'}
                  </motion.button>
                </div>
              </div>

              {/* Column Selection */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Show Columns</h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedColumns.clicks}
                      onChange={() => setSelectedColumns(prev => ({ ...prev, clicks: !prev.clicks }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-900">Clicks</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedColumns.engagingTime}
                      onChange={() => setSelectedColumns(prev => ({ ...prev, engagingTime: !prev.engagingTime }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-900">Engaging Time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedColumns.replies}
                      onChange={() => setSelectedColumns(prev => ({ ...prev, replies: !prev.replies }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-900">Replies</span>
                  </label>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                        {selectedColumns.clicks && <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>}
                        {selectedColumns.engagingTime && <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engaging Time</th>}
                        {selectedColumns.replies && <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Replies</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredSortedData().map((entry, i) => (
                        <motion.tr 
                          key={entry._id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{i + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.name}</td>
                          {selectedColumns.clicks && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.clicks}</td>}
                          {selectedColumns.engagingTime && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(entry.engagingTime)}</td>}
                          {selectedColumns.replies && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.replies}</td>}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {getFilteredSortedData().length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No data available</p>
                    <p className="text-gray-400">Click "Refresh" to load data</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Saved Tables Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Tables</h2>
              
              {savedTables.length === 0 ? (
                <div className="text-center py-12">
                  <Save className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No saved tables</p>
                  <p className="text-gray-400">Save your current table configuration to view it here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedTables.map((table, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 truncate">{table.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateTable(table.title)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTable(table.title)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{table.data?.length || 0} entries</p>
                      <button
                        onClick={() => exportToExcel(table.title, table.data, table.config)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* User Activity Analysis Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Activity Analysis</h2>
                  <p className="text-gray-600 mt-2">Comprehensive analysis based on clicks, browse time, and replies</p>
                </div>
                <div className="flex gap-3 items-center">
                  {/* Activity Filter Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Filter by Activity:</label>
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white shadow-sm text-black"
                    >
                      <option value="All" className="text-black">All Users</option>
                      <option value="Highly Active" className="text-black">Highly Active</option>
                      <option value="Active" className="text-black">Active</option>
                      <option value="Regular" className="text-black">Regular</option>
                      <option value="Silent" className="text-black">Silent</option>
                      <option value="Churned" className="text-black">Churned</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchUserActivityData}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition-all duration-300"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Refresh Data
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportUserActivityToExcel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition-all duration-300"
                  >
                    <Download className="h-5 w-5" />
                    Export Table
                  </motion.button>
                </div>
              </div>

              {/* Activity Level Legend */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity Level Standards</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium text-black">Highly Active</span>
                      <span className="text-black">(80-100 pts)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#059669'}}></div>
                      <span className="font-medium text-black">Active</span>
                      <span className="text-black">(60-79 pts)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium text-black">Regular</span>
                      <span className="text-black">(40-59 pts)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="font-medium text-black">Silent</span>
                      <span className="text-black">(15-39 pts)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="font-medium text-black">Churned</span>
                      <span className="text-black">(&lt;15 pts)</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-black">
                  * Activity score is calculated based on user clicks, browse time, and replies, with a maximum of 100 points
                </div>
              </div>

              {/* Activity Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                {/* Filter Result Counter */}
                {activityFilter !== 'All' && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-black text-xs font-bold">Filtered Results</p>
                        <p className="text-xl font-bold text-black">
                          {getFilteredUserActivityData().length}
                        </p>
                        <p className="text-xs text-black">{activityFilter} users</p>
                      </div>
                      <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Filter className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-xs font-bold">Highly Active</p>
                      <p className="text-xl font-bold text-black">
                        {userActivityData.filter(u => u.userClassification === 'Highly Active').length}
                      </p>
                      <p className="text-xs text-black">≥80 pts</p>
                    </div>
                    <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-xs font-bold">Active Users</p>
                      <p className="text-xl font-bold text-black">
                        {userActivityData.filter(u => u.userClassification === 'Active').length}
                      </p>
                      <p className="text-xs text-black">60-79 pts</p>
                    </div>
                    <div className="h-10 w-10 bg-green-700 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-xs font-bold">Regular Users</p>
                      <p className="text-xl font-bold text-black">
                        {userActivityData.filter(u => u.userClassification === 'Regular').length}
                      </p>
                      <p className="text-xs text-black">40-59 pts</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-xs font-bold">Silent Users</p>
                      <p className="text-xl font-bold text-black">
                        {userActivityData.filter(u => u.userClassification === 'Silent').length}
                      </p>
                      <p className="text-xs text-black">15-39 pts</p>
                    </div>
                    <div className="h-10 w-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-xs font-bold">Churned Users</p>
                      <p className="text-xl font-bold text-black">
                        {userActivityData.filter(u => u.userClassification === 'Churned').length}
                      </p>
                      <p className="text-xs text-black">&lt;15 pts</p>
                    </div>
                    <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Activity Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Filter Status Bar */}
                {activityFilter !== 'All' && (
                  <div className="bg-indigo-600 px-6 py-3 border-b border-indigo-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-white" />
                        <span className="text-sm font-medium text-white">
                          Showing {getFilteredUserActivityData().length} {activityFilter} users out of {userActivityData.length} total
                        </span>
                      </div>
                      <button
                        onClick={() => setActivityFilter('All')}
                        className="text-xs text-white hover:text-gray-200 font-medium"
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">No.</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Username</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">User Type</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Clicks</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Browse Time</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Replies</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Activity Score</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredUserActivityData().map((user, i) => (
                        <motion.tr 
                          key={user._id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{i + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              user.userType === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.userType === 'admin' ? 'Admin' : 'Customer'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.clicks}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{formatTime(user.engagingTime)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.replies}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-black">{user.activityScore}</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-300"
                                  style={{ 
                                    width: `${Math.min(user.activityScore, 100)}%`,
                                    backgroundColor: user.classificationColor
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span 
                              className="inline-flex px-3 py-1 text-xs font-medium rounded-full border"
                              style={{ 
                                backgroundColor: user.classificationBgColor,
                                color: user.classificationColor,
                                borderColor: user.classificationColor
                              }}
                            >
                              {user.userClassification}
                            </span>
                            <div className="mt-1 text-xs text-black">
                              Score: {user.activityScore}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {getFilteredUserActivityData().length === 0 && userActivityData.length > 0 && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-black text-lg">No users found for "{activityFilter}" classification</p>
                    <p className="text-black">Try selecting a different filter or "All Users"</p>
                  </div>
                )}
                {userActivityData.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-black text-lg">No user activity data available</p>
                    <p className="text-black">Click "Refresh Data" to load user activity analysis</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Recommendations Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchRecommendations}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Refresh Recommendations'}
                </motion.button>
              </div>

              {recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No recommendations available</p>
                  <p className="text-gray-400">Click "Refresh Recommendations" to generate insights</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, index) => (
                    <motion.div 
                      key={rec.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-700 leading-relaxed">{rec.text || rec}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Chart Creation Modal */}
        <AnimatePresence>
          {showChartModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Create New Chart</h2>
                    <button
                      onClick={() => setShowChartModal(false)}
                      className="text-white hover:text-indigo-200 transition-colors duration-200"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Chart Title</label>
                    <input
                      type="text"
                      value={newChartConfig.title}
                      onChange={(e) => setNewChartConfig({ ...newChartConfig, title: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      placeholder="Enter chart title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Chart Type</label>
                    <select
                      value={newChartConfig.type}
                      onChange={(e) => setNewChartConfig({ ...newChartConfig, type: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    >
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                      <option value="pie">Pie Chart</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Metric</label>
                    <select
                      value={newChartConfig.metric}
                      onChange={(e) => setNewChartConfig({ ...newChartConfig, metric: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    >
                      <option value="clicks">Clicks</option>
                      <option value="engagingTime">Engaging Time</option>
                      <option value="replies">Replies</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowChartModal(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={createNewChart}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Create Chart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}