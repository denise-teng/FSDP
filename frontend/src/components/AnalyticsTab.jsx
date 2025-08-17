import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Line, Bar, Pie, Scatter, Doughnut, PolarArea, Radar, Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
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
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
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
    xAxis: 'name',
    yAxis: 'clicks',
    sizeAxis: '', // For bubble/scatter plots - represents circle size
    colorAxis: '', // For additional dimension - represents color coding
    groupBy: '',
    aggregation: 'none',
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

  const exportChartData = (chart) => {
    try {
      let exportData = [];
      
      if (chart.type === 'scatter') {
        // For scatter plots, export x,y coordinates and additional dimensions
        exportData = chart.data.datasets[0].data.map((point, index) => {
          const entry = {
            'User': point.label || `Point ${index + 1}`,
            [`${getAxisLabel(chart.config.xAxis)} (X-Axis)`]: point.x,
            [`${getAxisLabel(chart.config.yAxis)} (Y-Axis)`]: point.y
          };
          
          if (chart.config.sizeAxis && point.sizeValue !== undefined) {
            entry[`${getAxisLabel(chart.config.sizeAxis)} (Size)`] = point.sizeValue;
          }
          
          if (chart.config.colorAxis && point.colorValue !== undefined) {
            entry[`${getAxisLabel(chart.config.colorAxis)} (Color)`] = point.colorValue;
          }
          
          return entry;
        });
      } else if (['pie', 'doughnut', 'polarArea'].includes(chart.type)) {
        // For circular charts, export labels and values
        exportData = chart.data.labels.map((label, index) => ({
          'Category': label,
          'Value': chart.data.datasets[0].data[index]
        }));
      } else if (chart.type === 'radar') {
        // For radar charts, export each user's metrics
        exportData = chart.data.datasets.map(dataset => {
          const entry = { 'User': dataset.label };
          chart.data.labels.forEach((label, index) => {
            entry[label] = dataset.data[index];
          });
          return entry;
        });
      } else {
        // For standard charts (line, bar), export labels and values
        exportData = chart.data.labels.map((label, index) => ({
          [chart.config.xAxis || 'Label']: label,
          [chart.config.yAxis || 'Value']: chart.data.datasets[0].data[index]
        }));
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart Data');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data_blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(data_blob, `${chart.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chart_data.xlsx`);
      toast.success('Chart data exported successfully!');
    } catch (error) {
      console.error('Error exporting chart data:', error);
      toast.error('Failed to export chart data');
    }
  };

  const createNewChart = () => {
    if (!newChartConfig.title) {
      toast.error('Please enter a chart title');
      return;
    }

    // Choose the correct dataset based on whether activityScore is needed
    const needsActivityScore = [
      newChartConfig.xAxis,
      newChartConfig.yAxis,
      newChartConfig.sizeAxis,
      newChartConfig.colorAxis
    ].some(axis => axis === 'activityScore' || axis === 'userClassification' || axis === 'daysSinceLastActivity');
    
    const chartDataSource = needsActivityScore ? userActivityData : data;
    
    console.log('Chart data source decision:', {
      needsActivityScore,
      axes: {
        x: newChartConfig.xAxis,
        y: newChartConfig.yAxis,
        size: newChartConfig.sizeAxis,
        color: newChartConfig.colorAxis
      },
      dataSource: needsActivityScore ? 'userActivityData' : 'data',
      dataLength: chartDataSource.length
    });

    let chartData = {};

    // Handle different chart types
    if (newChartConfig.type === 'scatter') {
      // Enhanced scatter plot with up to 4 dimensions: x, y, size, color
      const maxSizeValue = newChartConfig.sizeAxis ? Math.max(...chartDataSource.map(entry => entry[newChartConfig.sizeAxis] || 0)) : 1;
      const colorValues = newChartConfig.colorAxis ? chartDataSource.map(entry => entry[newChartConfig.colorAxis] || 0) : [];
      const maxColorValue = colorValues.length > 0 ? Math.max(...colorValues) : 1;
      const minColorValue = colorValues.length > 0 ? Math.min(...colorValues) : 0;
      
      // Generate color palette for different values
      const getColorForValue = (value) => {
        if (!newChartConfig.colorAxis) return 'rgba(99, 102, 241, 0.6)';
        
        // Normalize value to 0-1 range
        const normalizedValue = maxColorValue > minColorValue ? 
          (value - minColorValue) / (maxColorValue - minColorValue) : 0;
        
        // Create color gradient from blue to red
        const red = Math.floor(255 * normalizedValue);
        const blue = Math.floor(255 * (1 - normalizedValue));
        const green = Math.floor(128 * (1 - Math.abs(normalizedValue - 0.5) * 2));
        
        return `rgba(${red}, ${green}, ${blue}, 0.7)`;
      };

      chartData = {
        datasets: [{
          label: `${getAxisLabel(newChartConfig.xAxis)} vs ${getAxisLabel(newChartConfig.yAxis)}`,
          data: chartDataSource.map(entry => {
            const sizeValue = newChartConfig.sizeAxis ? (entry[newChartConfig.sizeAxis] || 0) : 5;
            const normalizedSize = newChartConfig.sizeAxis ? 
              (sizeValue / maxSizeValue) * 20 + 5 : 8; // Size range: 5-25 pixels
            
            const colorValue = newChartConfig.colorAxis ? (entry[newChartConfig.colorAxis] || 0) : 0;
            
            return {
              x: entry[newChartConfig.xAxis] || 0,
              y: entry[newChartConfig.yAxis] || 0,
              r: normalizedSize, // Bubble size
              label: entry.name || 'Unknown',
              sizeValue: sizeValue,
              colorValue: colorValue,
              backgroundColor: getColorForValue(colorValue)
            };
          }),
          backgroundColor: chartDataSource.map(entry => {
            const colorValue = newChartConfig.colorAxis ? (entry[newChartConfig.colorAxis] || 0) : 0;
            return getColorForValue(colorValue);
          }),
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          pointRadius: chartDataSource.map(entry => {
            if (!newChartConfig.sizeAxis) return 8;
            const sizeValue = entry[newChartConfig.sizeAxis] || 0;
            return (sizeValue / maxSizeValue) * 15 + 5; // Size range: 5-20 pixels
          }),
          pointHoverRadius: chartDataSource.map(entry => {
            if (!newChartConfig.sizeAxis) return 10;
            const sizeValue = entry[newChartConfig.sizeAxis] || 0;
            return (sizeValue / maxSizeValue) * 18 + 7; // Hover size range: 7-25 pixels
          })
        }]
      };
    } else if (['pie', 'doughnut', 'polarArea'].includes(newChartConfig.type)) {
      // Circular charts
      const aggregatedData = aggregateData(chartDataSource, newChartConfig.groupBy || newChartConfig.xAxis, newChartConfig.yAxis, newChartConfig.aggregation);
      chartData = {
        labels: aggregatedData.labels,
        datasets: [{
          label: getAxisLabel(newChartConfig.yAxis),
          data: aggregatedData.values,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#FF9999', '#66B2FF', '#99FF99', '#FFCC99', '#FF99CC', '#99CCFF'
          ],
          borderColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#FF9999', '#66B2FF', '#99FF99', '#FFCC99', '#FF99CC', '#99CCFF'
          ],
          borderWidth: 2
        }]
      };
    } else if (newChartConfig.type === 'bubble') {
      // Bubble chart - similar to scatter but with bubble sizing
      const maxSizeValue = newChartConfig.sizeAxis ? Math.max(...chartDataSource.map(entry => entry[newChartConfig.sizeAxis] || 0)) : 1;
      
      console.log('Bubble Chart Debug:', {
        xAxis: newChartConfig.xAxis,
        yAxis: newChartConfig.yAxis,
        sizeAxis: newChartConfig.sizeAxis,
        dataSource: needsActivityScore ? 'userActivityData' : 'data',
        sampleData: chartDataSource.slice(0, 3),
        maxSizeValue
      });
      
      chartData = {
        datasets: [{
          label: `${getAxisLabel(newChartConfig.xAxis)} vs ${getAxisLabel(newChartConfig.yAxis)}`,
          data: chartDataSource.map(entry => {
            const sizeValue = newChartConfig.sizeAxis ? (entry[newChartConfig.sizeAxis] || 0) : 10;
            const normalizedSize = newChartConfig.sizeAxis ? 
              (sizeValue / maxSizeValue) * 30 + 5 : 15; // Size range: 5-35 pixels
            
            const xValue = entry[newChartConfig.xAxis] || 0;
            const yValue = entry[newChartConfig.yAxis] || 0;
            
            console.log('Data point:', {
              name: entry.name,
              xAxis: newChartConfig.xAxis,
              xValue,
              yAxis: newChartConfig.yAxis, 
              yValue,
              sizeAxis: newChartConfig.sizeAxis,
              sizeValue
            });
            
            return {
              x: xValue,
              y: yValue,
              r: normalizedSize,
              label: entry.name || 'Unknown',
              bubbleValue: sizeValue
            };
          }),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2
        }]
      };
    } else if (newChartConfig.type === 'area') {
      // Area chart - line chart with filled area
      const processedData = processChartData(chartDataSource, newChartConfig);
      chartData = {
        labels: processedData.labels,
        datasets: [{
          label: getAxisLabel(newChartConfig.yAxis),
          data: processedData.values,
          backgroundColor: 'rgba(75, 192, 192, 0.4)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      };
    } else if (newChartConfig.type === 'heatmap') {
      // Heatmap - custom visualization
      const processedData = processChartData(chartDataSource, newChartConfig);
      chartData = {
        labels: processedData.labels,
        datasets: [{
          label: getAxisLabel(newChartConfig.yAxis),
          data: processedData.values,
          backgroundColor: processedData.values.map(value => {
            const max = Math.max(...processedData.values);
            const min = Math.min(...processedData.values);
            const intensity = (value - min) / (max - min);
            const red = Math.floor(255 * intensity);
            const blue = Math.floor(255 * (1 - intensity));
            return `rgb(${red}, 100, ${blue})`;
          })
        }]
      };
    } else if (newChartConfig.type === 'radar') {
      // Radar chart
      const radarData = prepareRadarData(chartDataSource, newChartConfig);
      chartData = radarData;
    } else {
      // Standard charts (line, bar, etc.)
      const processedData = processChartData(chartDataSource, newChartConfig);
      chartData = {
        labels: processedData.labels,
        datasets: [{
          label: getAxisLabel(newChartConfig.yAxis),
          data: processedData.values,
          backgroundColor: newChartConfig.type === 'line' 
            ? 'rgba(54, 162, 235, 0.2)'
            : 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: newChartConfig.type === 'line'
        }]
      };
    }

    const newChart = {
      id: Date.now(),
      title: newChartConfig.title,
      type: newChartConfig.type,
      data: chartData,
      config: { ...newChartConfig }
    };

    setCharts(prev => [...prev, newChart]);
    setShowChartModal(false);
    setNewChartConfig({ 
      title: '', 
      type: 'line', 
      xAxis: 'name', 
      yAxis: 'clicks', 
      sizeAxis: '',
      colorAxis: '',
      groupBy: '', 
      aggregation: 'none',
      timeRange: 'monthly' 
    });
    toast.success('Chart created successfully!');
  };

  // Helper functions for data processing
  const getAxisLabel = (axis) => {
    const labels = {
      'name': 'Name',
      'clicks': 'Clicks',
      'engagingTime': 'Engaging Time (seconds)',
      'replies': 'Replies',
      'userType': 'User Type',
      'daysSinceLastActivity': 'Days Since Last Activity',
      'activityScore': 'Activity Score',
      'userClassification': 'User Classification'
    };
    return labels[axis] || axis;
  };

  const processChartData = (data, config) => {
    if (config.groupBy) {
      return aggregateData(data, config.groupBy, config.yAxis, config.aggregation);
    } else {
      return {
        labels: data.map(entry => entry[config.xAxis] || 'Unknown'),
        values: data.map(entry => entry[config.yAxis] || 0)
      };
    }
  };

  const aggregateData = (data, groupField, valueField, aggregation) => {
    const grouped = data.reduce((acc, entry) => {
      const key = entry[groupField] || 'Unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry[valueField] || 0);
      return acc;
    }, {});

    const labels = Object.keys(grouped);
    const values = labels.map(label => {
      const values = grouped[label];
      switch (aggregation) {
        case 'sum':
          return values.reduce((sum, val) => sum + val, 0);
        case 'average':
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        case 'count':
          return values.length;
        case 'max':
          return Math.max(...values);
        case 'min':
          return Math.min(...values);
        default:
          return values.reduce((sum, val) => sum + val, 0);
      }
    });

    return { labels, values };
  };

  const prepareRadarData = (data, config) => {
    // For radar charts, we'll use multiple metrics for comparison
    const metrics = ['clicks', 'engagingTime', 'replies'];
    const sampleSize = Math.min(5, data.length); // Limit to 5 users for readability
    
    return {
      labels: metrics.map(metric => getAxisLabel(metric)),
      datasets: data.slice(0, sampleSize).map((entry, index) => ({
        label: entry.name || `User ${index + 1}`,
        data: metrics.map(metric => entry[metric] || 0),
        backgroundColor: `rgba(${54 + index * 50}, ${162 - index * 20}, ${235 - index * 30}, 0.2)`,
        borderColor: `rgba(${54 + index * 50}, ${162 - index * 20}, ${235 - index * 30}, 1)`,
        borderWidth: 2
      }))
    };
  };

  const deleteChart = (chartId) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
    toast.success('Chart deleted successfully!');
  };

  const duplicateChart = (chart) => {
    const duplicatedChart = {
      ...chart,
      id: Date.now(),
      title: `${chart.title} (Copy)`
    };
    setCharts(prev => [...prev, duplicatedChart]);
    toast.success('Chart duplicated successfully!');
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

  const scatterChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataPoint = context.raw;
            let tooltipText = `${dataPoint.label || 'Unknown'}: (${dataPoint.x}, ${dataPoint.y})`;
            
            if (dataPoint.sizeValue !== undefined) {
              tooltipText += `, Size: ${dataPoint.sizeValue}`;
            }
            if (dataPoint.colorValue !== undefined) {
              tooltipText += `, Color Value: ${dataPoint.colorValue}`;
            }
            
            return tooltipText;
          },
          afterLabel: function(context) {
            const chart = context.chart;
            if (chart.config.data.datasets[0].pointRadius) {
              return `Circle Size: ${chart.config.data.datasets[0].pointRadius[context.dataIndex]}px`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'X Axis'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Y Axis'
        }
      }
    }
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      r: {
        beginAtZero: true
      }
    }
  };

  const polarAreaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      r: {
        beginAtZero: true
      }
    }
  };

  const getBubbleChartOptions = (chartConfig) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataPoint = context.raw;
            let tooltipText = `${dataPoint.label || 'Unknown'}: `;
            tooltipText += `${getAxisLabel(chartConfig.xAxis)}: ${dataPoint.x}, `;
            tooltipText += `${getAxisLabel(chartConfig.yAxis)}: ${dataPoint.y}`;
            if (dataPoint.r !== undefined && chartConfig.sizeAxis) {
              tooltipText += `, ${getAxisLabel(chartConfig.sizeAxis)}: ${dataPoint.bubbleValue || dataPoint.r}`;
            }
            return tooltipText;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: getAxisLabel(chartConfig.xAxis)
        }
      },
      y: {
        title: {
          display: true,
          text: getAxisLabel(chartConfig.yAxis)
        }
      }
    }
  });

  const bubbleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataPoint = context.raw;
            let tooltipText = `${dataPoint.label || 'Unknown'}: (${dataPoint.x}, ${dataPoint.y})`;
            if (dataPoint.r !== undefined) {
              tooltipText += `, Bubble Size: ${dataPoint.bubbleValue || dataPoint.r}`;
            }
            return tooltipText;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'X Axis'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Y Axis'
        }
      }
    }
  };

  const areaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      filler: {
        propagate: false
      }
    },
    elements: {
      point: {
        radius: 0
      }
    },
    interaction: {
      intersect: false
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'X Axis'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Y Axis'
        },
        stacked: true
      }
    }
  };

  // Custom Heatmap Component
  const Heatmap = ({ data, options }) => {
    const { labels, datasets } = data;
    const values = datasets[0]?.data || [];
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    const getHeatmapColor = (value) => {
      const intensity = (value - minValue) / (maxValue - minValue);
      const red = Math.floor(255 * intensity);
      const blue = Math.floor(255 * (1 - intensity));
      return `rgb(${red}, 100, ${blue})`;
    };

    const cellSize = 40;
    const cols = Math.ceil(Math.sqrt(labels.length));
    const rows = Math.ceil(labels.length / cols);

    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div 
          className="grid gap-1 p-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`
          }}
        >
          {labels.map((label, index) => (
            <div
              key={index}
              className="flex items-center justify-center text-xs font-medium text-white rounded relative group cursor-pointer"
              style={{
                backgroundColor: getHeatmapColor(values[index] || 0),
                width: `${cellSize}px`,
                height: `${cellSize}px`
              }}
              title={`${label}: ${values[index] || 0}`}
            >
              <span className="truncate px-1">{label.substring(0, 6)}</span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {label}: {values[index] || 0}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center mt-4 space-x-2">
          <span className="text-xs text-gray-600">Low</span>
          <div className="flex h-4 w-32">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{
                  backgroundColor: `rgb(${Math.floor(255 * (i / 19))}, 100, ${Math.floor(255 * (1 - i / 19))})`
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">High</span>
        </div>
      </div>
    );
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
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                        {chart.config && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                              {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}
                            </span>
                            {chart.config.xAxis && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                X: {getAxisLabel(chart.config.xAxis)}
                              </span>
                            )}
                            {chart.config.yAxis && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Y: {getAxisLabel(chart.config.yAxis)}
                              </span>
                            )}
                            {chart.config.sizeAxis && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Size: {getAxisLabel(chart.config.sizeAxis)}
                              </span>
                            )}
                            {chart.config.colorAxis && (
                              <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                                Color: {getAxisLabel(chart.config.colorAxis)}
                              </span>
                            )}
                            {chart.config.groupBy && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                Grouped by {getAxisLabel(chart.config.groupBy)}
                              </span>
                            )}
                            {chart.config.aggregation && chart.config.aggregation !== 'none' && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                {chart.config.aggregation}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => duplicateChart(chart)}
                          className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Duplicate Chart"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => exportChartData(chart)}
                          className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Export Chart Data"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteChart(chart.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Chart"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-64">
                      {chart.type === 'line' && <Line data={chart.data} options={chartOptions} />}
                      {chart.type === 'bar' && <Bar data={chart.data} options={barChartOptions} />}
                      {chart.type === 'pie' && <Pie data={chart.data} options={pieChartOptions} />}
                      {chart.type === 'scatter' && <Scatter data={chart.data} options={scatterChartOptions} />}
                      {chart.type === 'doughnut' && <Doughnut data={chart.data} options={pieChartOptions} />}
                      {chart.type === 'polarArea' && <PolarArea data={chart.data} options={polarAreaOptions} />}
                      {chart.type === 'radar' && <Radar data={chart.data} options={radarChartOptions} />}
                      {chart.type === 'bubble' && <Bubble data={chart.data} options={getBubbleChartOptions(chart.config)} />}
                      {chart.type === 'area' && <Line data={chart.data} options={areaChartOptions} />}
                      {chart.type === 'heatmap' && <Heatmap data={chart.data} options={{}} />}
                    </div>
                    
                    {/* Multi-dimensional legend for scatter and bubble plots */}
                    {['scatter', 'bubble'].includes(chart.type) && (chart.config.sizeAxis || chart.config.colorAxis) && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Chart Legend:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {chart.config.sizeAxis && (
                            <div className="flex items-center">
                              <div className="flex space-x-1 mr-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                              </div>
                              <span className="text-gray-600">
                                {chart.type === 'bubble' ? 'Bubble' : 'Circle'} size = {getAxisLabel(chart.config.sizeAxis)}
                              </span>
                            </div>
                          )}
                          {chart.config.colorAxis && (
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              </div>
                              <span className="text-gray-600">
                                Color gradient = {getAxisLabel(chart.config.colorAxis)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
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
                      <option value="doughnut">Doughnut Chart</option>
                      <option value="scatter">Scatter Plot</option>
                      <option value="radar">Radar Chart</option>
                      <option value="polarArea">Polar Area Chart</option>
                      <option value="bubble">Bubble Chart</option>
                      <option value="area">Area Chart</option>
                      <option value="heatmap">Heatmap</option>
                    </select>
                  </div>

                  {/* X-Axis Selection (not for pie, doughnut, radar) */}
                  {!['pie', 'doughnut', 'radar', 'polarArea', 'heatmap'].includes(newChartConfig.type) && (
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        {newChartConfig.type === 'scatter' ? 'X-Axis Variable' : 'X-Axis (Labels)'}
                      </label>
                      <select
                        value={newChartConfig.xAxis}
                        onChange={(e) => setNewChartConfig({ ...newChartConfig, xAxis: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      >
                        <option value="name">User Name</option>
                        <option value="userType">User Type</option>
                        <option value="userClassification">User Classification</option>
                        {['scatter', 'bubble'].includes(newChartConfig.type) && (
                          <>
                            <option value="clicks">Clicks</option>
                            <option value="engagingTime">Engaging Time</option>
                            <option value="replies">Replies</option>
                            <option value="activityScore">Activity Score</option>
                            <option value="daysSinceLastActivity">Days Since Last Activity</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Y-Axis Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      {['scatter', 'bubble'].includes(newChartConfig.type) ? 'Y-Axis Variable' : 
                       ['pie', 'doughnut', 'polarArea'].includes(newChartConfig.type) ? 'Value Variable' : 'Y-Axis (Values)'}
                    </label>
                    <select
                      value={newChartConfig.yAxis}
                      onChange={(e) => setNewChartConfig({ ...newChartConfig, yAxis: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    >
                      <option value="clicks">Clicks</option>
                      <option value="engagingTime">Engaging Time</option>
                      <option value="replies">Replies</option>
                      <option value="activityScore">Activity Score</option>
                      <option value="daysSinceLastActivity">Days Since Last Activity</option>
                    </select>
                  </div>

                  {/* Size Axis (for scatter and bubble plots) */}
                  {['scatter', 'bubble'].includes(newChartConfig.type) && (
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        {newChartConfig.type === 'bubble' ? 'Bubble Size Variable (Required)' : 'Circle Size Variable (Optional)'}
                        <span className="text-xs text-gray-500 ml-1">- Controls bubble size</span>
                      </label>
                      <select
                        value={newChartConfig.sizeAxis}
                        onChange={(e) => setNewChartConfig({ ...newChartConfig, sizeAxis: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">No Size Mapping</option>
                        <option value="clicks">Clicks</option>
                        <option value="engagingTime">Engaging Time</option>
                        <option value="replies">Replies</option>
                        <option value="activityScore">Activity Score</option>
                        <option value="daysSinceLastActivity">Days Since Last Activity</option>
                      </select>
                    </div>
                  )}

                  {/* Color Axis (for scatter and bubble plots) */}
                  {['scatter', 'bubble'].includes(newChartConfig.type) && (
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Color Variable (Optional)
                        <span className="text-xs text-gray-500 ml-1">- Controls bubble color gradient</span>
                      </label>
                      <select
                        value={newChartConfig.colorAxis}
                        onChange={(e) => setNewChartConfig({ ...newChartConfig, colorAxis: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">No Color Mapping</option>
                        <option value="clicks">Clicks</option>
                        <option value="engagingTime">Engaging Time</option>
                        <option value="replies">Replies</option>
                        <option value="activityScore">Activity Score</option>
                        <option value="daysSinceLastActivity">Days Since Last Activity</option>
                        <option value="userType">User Type</option>
                        <option value="userClassification">User Classification</option>
                      </select>
                    </div>
                  )}

                  {/* Group By (for aggregation) */}
                  {!['scatter', 'radar', 'bubble'].includes(newChartConfig.type) && (
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Group By (Optional)</label>
                      <select
                        value={newChartConfig.groupBy}
                        onChange={(e) => setNewChartConfig({ ...newChartConfig, groupBy: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">No Grouping</option>
                        <option value="userType">User Type</option>
                        <option value="userClassification">User Classification</option>
                      </select>
                    </div>
                  )}

                  {/* Aggregation Method (when grouping is selected) */}
                  {newChartConfig.groupBy && !['scatter', 'radar'].includes(newChartConfig.type) && (
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Aggregation Method</label>
                      <select
                        value={newChartConfig.aggregation}
                        onChange={(e) => setNewChartConfig({ ...newChartConfig, aggregation: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      >
                        <option value="sum">Sum</option>
                        <option value="average">Average</option>
                        <option value="count">Count</option>
                        <option value="max">Maximum</option>
                        <option value="min">Minimum</option>
                      </select>
                    </div>
                  )}

                  {/* Data Preview */}
                  {data.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Data Preview (First 3 Records):</h4>
                      <div className="text-xs text-gray-700 space-y-1">
                        {data.slice(0, 3).map((entry, index) => (
                          <div key={index} className="bg-white p-2 rounded border">
                            <span className="font-medium">{entry.name}:</span>
                            <span className="ml-1">
                              Clicks: {entry.clicks || 0}, 
                              Time: {Math.floor((entry.engagingTime || 0) / 60)}m, 
                              Replies: {entry.replies || 0}
                              {entry.userType && `, Type: ${entry.userType}`}
                              {entry.userClassification && `, Class: ${entry.userClassification}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chart Type Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Chart Type Info:</h4>
                    <p className="text-xs text-blue-800">
                      {newChartConfig.type === 'line' && 'Shows trends over continuous data points'}
                      {newChartConfig.type === 'bar' && 'Compares different categories or groups'}
                      {newChartConfig.type === 'pie' && 'Shows proportions of a whole dataset'}
                      {newChartConfig.type === 'doughnut' && 'Similar to pie chart with a hollow center'}
                      {newChartConfig.type === 'area' && 'Shows trends with filled areas below the line'}
                      {newChartConfig.type === 'heatmap' && 'Shows data density and patterns using color intensity'}
                      {['scatter', 'bubble'].includes(newChartConfig.type) && (
                        newChartConfig.sizeAxis || newChartConfig.colorAxis ? 
                        `Multi-dimensional analysis: X-axis (${getAxisLabel(newChartConfig.xAxis)}), Y-axis (${getAxisLabel(newChartConfig.yAxis)})` +
                        (newChartConfig.sizeAxis ? `, ${newChartConfig.type === 'bubble' ? 'bubble' : 'circle'} size (${getAxisLabel(newChartConfig.sizeAxis)})` : '') +
                        (newChartConfig.colorAxis ? `, color gradient (${getAxisLabel(newChartConfig.colorAxis)})` : '') :
                        `Shows correlation between two variables${newChartConfig.type === 'bubble' ? ' with bubble sizes' : ''}. Add size/color dimensions for deeper insights.`
                      )}
                      {newChartConfig.type === 'radar' && 'Compares multiple metrics for top 5 users'}
                      {newChartConfig.type === 'polarArea' && 'Shows data in a circular format with varying radii'}
                    </p>
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