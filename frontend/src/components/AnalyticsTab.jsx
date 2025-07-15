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

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number') return '-';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  useEffect(() => {
    localStorage.setItem('savedAnalyticsTables', JSON.stringify(savedTables));
  }, [savedTables]);

  // fetchData 函数从 API (http://localhost:5000/api/analytics/client-engagements) 获取数据，并将其存储到 data 状态中。这些数据用来填充表格和图表。
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/analytics/client-engagements');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const getFilteredSortedData = () => {
    let filtered = [...data];
    if (filters.userType) {
      filtered = filtered.filter(entry => entry.userType === filters.userType);
    }
    return filtered.sort((a, b) => b[sorting] - a[sorting]);
  };

  // generateTable：根据数据生成表格的每一行。它会显示筛选和排序后的数据。
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

  // saveTable：当用户保存表格时，将表格的名称、配置（列、过滤、排序条件）和数据一起保存到 savedTables 状态，并在本地存储中保存。
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

  // deleteTable：删除某个表格，并在本地存储中更新。
  const deleteTable = (tableTitle) => {
    setSavedTables(savedTables.filter(t => t.title !== tableTitle));
    // If deleting the table currently being edited, reset edit state
    if (editing?.title === tableTitle) {
      setEditing(null);
      setShowEdit(false);
      setTableName('');
    }
  };

  // updateTable：当用户想要更新表格时，根据已保存表格的配置恢复表格信息。
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

  // exportToExcel：该功能将表格数据导出为 Excel 文件。
  const exportToExcel = (tableTitle, tableData, tableConfig) => {
    if (!tableData || tableData.length === 0) {
      alert('No data available to export.');
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

  // Line, Bar, Pie 图表使用了 react-chartjs-2 库。
  // chartData 包含了图表的数据，chartOptions 定义了图表的配置。
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'User Engagement',
        data: [30, 45, 60, 70, 90, 120],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Bar Chart 数据和配置
  const barChartData = {
    labels: ['Financial plan', 'Investment plan', 'Marketing plan', 'Sales plan', 'Customer support plan', 'Product development plan'],
    datasets: [
      {
        label: 'Enagagement Category',
        data: [30, 45, 60, 70, 90, 120],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Pie Chart 数据和配置
  const pieChartData = {
    labels: ['Category A', 'Category B', 'Category C'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 205, 86, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 205, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };




  // 布局  // 返回的 JSX 结构包含了图表、表格和按钮等元素，使用了 Tailwind CSS 来进行样式设计。
  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      {/* chart */}
      <h1 className="text-3xl font-bold mb-6">Analytics Graph</h1>
      <div className="mb-20">
        {/* First Row: Two Graphs */}
        <div className="flex space-x-4 mb-8">
          {/* Graph 1 */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full">
            <h2 className="text-xl font-semibold mb-4">Engagement Rate Graph</h2>
            <div className="w-full h-40 mb-4">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="flex justify-between">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-2">Edit</button>
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Delete</button>
            </div>
          </div>

          {/* Graph 2 */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full">
            <h2 className="text-xl font-semibold mb-4">User Activity Graph</h2>
            <div className="w-full h-40 mb-4">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="flex justify-between">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-2">Edit</button>
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Delete</button>
            </div>
          </div>
        </div>

        {/* Second Row: Two Graphs */}
        <div className="flex space-x-4">
          {/* Graph 3 */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full">
            <h2 className="text-xl font-semibold mb-4">Customer Feedback Distribution</h2>
            <div className="w-full h-40 mb-4">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className="flex justify-between">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-2">Edit</button>
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Delete</button>
            </div>
          </div>

          {/* Graph 4 */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full">
            <h2 className="text-xl font-semibold mb-4">View Rate for Each Category</h2>
            <div className="w-full h-40 mb-4">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
            <div className="flex justify-between">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-2">Edit</button>
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Delete</button>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-2">Create New Graph</button>
        </div>
      </div>







      {/* User Engagement Analysis Dashboard */}
      <h1 className="text-3xl font-bold mb-6">User Engagement Analysis Dashboard</h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-20">
        <p className="text-sm text-gray-400 mb-4">To track most active users and potential users</p>
        <table className="w-full table-auto mb-4">
          <thead>
            <tr>
              <th className="p-2 border">User Info (Name & Email)</th>
              <th className="p-2 border">Main Browsing Area</th>
              <th className="p-2 border">Last Online</th>
              <th className="p-2 border">Clicks</th>
              <th className="p-2 border">Replies</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-700">
              <td className="p-2">John (john@example.com)</td>
              <td className="p-2">
                Loans<br />
                Retirement Plans<br />
                Financial Advice
              </td>
              <td className="p-2">2023-06-29</td>
              <td className="p-2">150</td>
              <td className="p-2">10</td>
            </tr>
            <tr className="bg-gray-700">
              <td className="p-2">Jane Smith (jane@example.com)</td>
              <td className="p-2">
                Loans<br />
                Mortgages<br />
                Financial Advice
              </td>
              <td className="p-2">2023-06-28</td>
              <td className="p-2">200</td>
              <td className="p-2">12</td>
            </tr>
            <tr className="bg-gray-700">
              <td className="p-2">Sam Wilson (sam@example.com)</td>
              <td className="p-2">
                Retirement Planning<br />
                Insurance
              </td>
              <td className="p-2">2023-06-30</td>
              <td className="p-2">120</td>
              <td className="p-2">8</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">View All</button>
        </div>
      </div>

      {/* Smart Suggestions Table */}
      <h1 className="text-3xl font-bold mb-6">Smart Suggestions</h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-20">
        <table className="w-full table-auto mb-4">
          <thead>
            <tr>
              <th className="p-2 border">Suggestion</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-700">
              <td className="p-2">Consider optimizing the click rate by reviewing the client interactions.</td>
              <td className="p-2">
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">View More</button>
                <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded ml-2">Delete</button>
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded ml-2">Regenerate</button>
              </td>
            </tr>
            <tr className="bg-gray-700">
              <td className="p-2">You may want to adjust the engagement time to improve client retention.</td>
              <td className="p-2">
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">View More</button>
                <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded ml-2">Delete</button>
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded ml-2">Regenerate</button>
              </td>
            </tr>
            <tr className="bg-gray-700">
              <td className="p-2">Check the number of replies to gauge how well clients are responding.</td>
              <td className="p-2">
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">View More</button>
                <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded ml-2">Delete</button>
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded ml-2">Regenerate</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create Custom Table</h1>

      {/* Your existing Custom Table Code */}
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
