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

  useEffect(() => {
    localStorage.setItem('savedAnalyticsTables', JSON.stringify(savedTables));
  }, [savedTables]);

  useEffect(() => {
    fetchData();
    fetchRecommendations();
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

  const fetchRecommendations = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.get('/analytics/engagement-recommendations');
      console.log('Recommendations fetched:', res.data); // Log to verify
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

  const generateTable = () => {
    return getFilteredSortedData().map((entry, i) => (
      <tr key={entry._id || i} className="bg-gray-800 border-t">
        <td className="p-2 border">{i + 1}</td>
        <td className="p-2 border">{entry.name}</td>
        {selectedColumns.clicks && <td className="p-2 border">{entry.clicks}</td>}
        {selectedColumns.engagingTime && <td className="p-2 border">{formatTime(entry.engagingTime)}</td>}
        {selectedColumns.replies && <td className="p-2 border">{entry.replies}</td>}
      </tr>
    ));
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
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const safeTitle = (tableTitle || 'Engagements').replace(/[/\\?%*:|"<>]/g, '-');
    saveAs(fileData, `${safeTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleRegenerate = async (id) => {
    try {
      setIsGenerating(true);
      const res = await axios.get('/analytics/engagement-recommendations');
      const newRecommendations = res.data.recommendations;

      setRecommendations(prev =>
        prev.map(rec => rec.id === id ? newRecommendations[0] : rec)
      );
      toast.success('Recommendation regenerated');
    } catch (err) {
      console.error('Error regenerating recommendation:', err);
      toast.error('Failed to regenerate recommendation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
    toast.success('Recommendation removed');
  };

  const handleViewDetails = (id) => {
    const rec = recommendations.find(r => r.id === id);
    toast(rec.text, {
      duration: 8000,
      position: 'top-center',
      style: {
        maxWidth: '500px',
        padding: '16px',
        background: '#1F2937',
        color: 'white'
      }
    });
  };

  const renderRecommendations = () => {
    if (isGenerating && recommendations.length === 0) {
      return (
        <tr className="bg-gray-700">
          <td colSpan="2" className="p-4 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              Generating recommendations...
            </div>
          </td>
        </tr>
      );
    }

    if (recommendations.length === 0) {
      return (
        <tr className="bg-gray-700">
          <td colSpan="2" className="p-4 text-center">
            No recommendations available. Click "Generate" to create some.
          </td>
        </tr>
      );
    }

    return recommendations.map((rec) => (
      <tr key={rec.id} className="bg-gray-700">
        <td className="p-4">{rec.text}</td>
        <td className="p-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDetails(rec.id)}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              View Details
            </button>
            <button
              onClick={() => handleRegenerate(rec.id)}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
              disabled={isGenerating}
            >
              Regenerate
            </button>
            <button
              onClick={() => handleDelete(rec.id)}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const createNewChart = () => {
    if (!newChartConfig.title) return;

    const newChart = {
      id: Date.now(),
      title: newChartConfig.title,
      type: newChartConfig.type,
      data: generateChartData(newChartConfig),
      config: { ...newChartConfig }
    };

    setCharts(prev => [...prev, newChart]);
    setShowChartModal(false);
    setNewChartConfig({
      title: '',
      type: 'line',
      metric: 'clicks',
      timeRange: 'monthly'
    });
  };

  const deleteChart = (id) => {
    setCharts(prev => prev.filter(chart => chart.id !== id));
  };

  const generateChartData = (config) => {
    const filteredData = getFilteredSortedData();
    return {
      labels: filteredData.map(user => user.name),
      datasets: [{
        label: `${config.metric} by User`,
        data: filteredData.map(user => user[config.metric] || 0),
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8'
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
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
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      {/* Dynamic Charts Section */}
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {charts.map(chart => (
            <div key={chart.id} className="bg-gray-800 p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">{chart.title}</h2>
              <div className="w-full h-64 mb-4">
                {chart.type === 'line' && <Line data={chart.data} options={chartOptions} />}
                {chart.type === 'bar' && <Bar data={chart.data} options={barChartOptions} />}
                {chart.type === 'pie' && <Pie data={chart.data} options={pieChartOptions} />}
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => deleteChart(chart.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setShowChartModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Create New Graph
          </button>
        </div>
      </div>

      {showChartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Chart</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-2">Chart Title</label>
                <input
                  type="text"
                  value={newChartConfig.title}
                  onChange={(e) => setNewChartConfig({ ...newChartConfig, title: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700"
                />
              </div>

              <div>
                <label className="block mb-2">Chart Type</label>
                <select
                  value={newChartConfig.type}
                  onChange={(e) => setNewChartConfig({ ...newChartConfig, type: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Metric</label>
                <select
                  value={newChartConfig.metric}
                  onChange={(e) => setNewChartConfig({ ...newChartConfig, metric: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700"
                >
                  <option value="clicks">Clicks</option>
                  <option value="engagingTime">Engaging Time</option>
                  <option value="replies">Replies</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowChartModal(false)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createNewChart}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Suggestions Section */}
      <div className="mb-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Smart Suggestions</h1>
          <button
            onClick={fetchRecommendations}
            disabled={isGenerating}
            className={`px-4 py-2 rounded ${isGenerating ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isGenerating ? 'Generating...' : 'Generate New Suggestions'}
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-md">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="p-2 border">Suggestion</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderRecommendations()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Table Section */}
      <h1 className="text-3xl font-bold mb-6">Create Custom Table</h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Please Enter Title Name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
          />
          <select
            value={filters.userType}
            onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
            className="p-2 rounded bg-gray-700 text-white"
          >
            <option value="">All Users</option>
            <option value="customer">Clients Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>

        <div className="space-x-4 mb-4">
          <label>
            <input
              type="checkbox"
              checked={selectedColumns.clicks}
              onChange={() =>
                setSelectedColumns(prev => ({ ...prev, clicks: !prev.clicks }))
              }
            />{' '}
            Click Rate
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedColumns.engagingTime}
              onChange={() =>
                setSelectedColumns(prev => ({ ...prev, engagingTime: !prev.engagingTime }))
              }
            />{' '}
            Engaging Time
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedColumns.replies}
              onChange={() =>
                setSelectedColumns(prev => ({ ...prev, replies: !prev.replies }))
              }
            />{' '}
            No. of Replies
          </label>
        </div>

        <div className="mb-4">
          <select
            value={sorting}
            onChange={(e) => setSorting(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
          >
            <option value="clicks">Sort by Clicks</option>
            <option value="engagingTime">Sort by Engaging Time</option>
            <option value="replies">Sort by Replies</option>
          </select>
        </div>

        <div className="space-x-4">
          <button
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Query Data
          </button>
          <button
            onClick={saveTable}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            {editing ? 'Update Table' : 'Save Table'}
          </button>
          <button
            onClick={() => exportToExcel(tableName, getFilteredSortedData(), {
              selectedColumns,
              filters,
              sorting,
            })}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded"
          >
            Export Current Table
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2 border">NO</th>
              <th className="p-2 border">Client Name</th>
              {selectedColumns.clicks && <th className="p-2 border">No. of Clicks</th>}
              {selectedColumns.engagingTime && <th className="p-2 border">Engaging Time</th>}
              {selectedColumns.replies && <th className="p-2 border">No. of Replies</th>}
            </tr>
          </thead>
          <tbody>{generateTable()}</tbody>
        </table>
      </div>

      <h2 className="text-xl mt-6 mb-2">Saved Tables</h2>
      <div className="space-y-4">
        {savedTables.map((table, index) => (
          <div key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded">
            <span className="text-lg">{table.title}</span>
            <div>
              <button
                onClick={() => exportToExcel(table.title, table.data, table.config)}
                className="bg-blue-600 px-4 py-2 rounded text-white mr-2"
              >
                Export
              </button>
              <button
                onClick={() => updateTable(table.title)}
                className="bg-yellow-500 px-4 py-2 rounded text-white mr-2"
              >
                Update
              </button>
              <button
                onClick={() => deleteTable(table.title)}
                className="bg-red-600 px-4 py-2 rounded text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}