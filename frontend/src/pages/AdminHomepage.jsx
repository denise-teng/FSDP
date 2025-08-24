import { useState, useMemo } from 'react';
import {
    Mail, Users, BarChart2, LayoutDashboard, MessageSquare,
    ArrowRight, ChevronDown, X, Check, MapPin, Phone,
    ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, Send, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import DraftsOverview from '../components/DraftsOverview';
import Navbar from '../components/Navbar';
import NearEvents from '../components/NearEvents';
import { Link } from 'react-router-dom';
import { useEventStore } from '../stores/useEventStore';
import axios from '../lib/axios';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);
// Example of tabs
const tabs = [
    { id: 'contacts', label: 'Contacts', icon: Mail },
    { id: 'quickMessages', label: 'Quick Messages', icon: MessageSquare },
];
// Local YYYY-MM-DD
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

// Parse event.date robustly (handles "YYYY-MM-DD" without UTC shift)
const parseEventDate = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [_, yy, mm, dd] = m;
      return new Date(Number(yy), Number(mm) - 1, Number(dd));
    }
    return new Date(value);
  }
  return new Date(value);
};

// HH:MM -> minutes
const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = String(timeStr).split(':').map(Number);
  return h * 60 + (m || 0);
};

const AdminHomePage = () => {
    const [currentUpdate, setCurrentUpdate] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [scheduledBroadcasts, setScheduledBroadcasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentBroadcastPage, setCurrentBroadcastPage] = useState(0);
    const [engagementData, setEngagementData] = useState([]);
    const [loadingEngagement, setLoadingEngagement] = useState(false);

    const BROADCASTS_PER_PAGE = 3;


    const { events, fetchAllEvents } = useEventStore();

  useEffect(() => {
    fetchAllEvents?.();
  }, [fetchAllEvents]);

  // Compute today's events (local)
  const todayStr = ymd(new Date());

  const todaysEvents = useMemo(() => {
    if (!events?.length) return [];
    return events
      .filter((ev) => {
        const d = parseEventDate(ev.date);
        if (!d) return false;
        // Show admin-visible items (approved/pending/rejected — adjust if you prefer)
        return ymd(d) === todayStr;
      })
      .sort((a, b) => {
        // sort by startTime if present
        const am = timeToMinutes(a.startTime) ?? 9999;
        const bm = timeToMinutes(b.startTime) ?? 9999;
        return am - bm;
      });
  }, [events, todayStr]);
    // Sample updates data
    const updates = [
        {
            id: 1,
            title: "New Client Onboarding",
            description: "5 new clients completed onboarding this week",
            date: "Today, 10:30 AM",
            icon: <Users className="h-6 w-6 text-indigo-600" />,
            color: "bg-indigo-100"
        },
        {
            id: 2,
            title: "Quarterly Reports",
            description: "Q2 financial reports are now available for review",
            date: "Yesterday, 3:45 PM",
            icon: <BarChart2 className="h-6 w-6 text-blue-600" />,
            color: "bg-blue-100"
        },
        {
            id: 3,
            title: "System Maintenance",
            description: "Scheduled maintenance this Saturday from 2-4 AM",
            date: "Jul 10, 2025",
            icon: <LayoutDashboard className="h-6 w-6 text-green-600" />,
            color: "bg-green-100"
        }
    ];

    // Auto-rotate updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isHovering) {
                setCurrentUpdate((prev) => (prev === updates.length - 1 ? 0 : prev + 1));
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isHovering]);

    // Fetch scheduled broadcasts
    useEffect(() => {
        fetchScheduledBroadcasts();
        fetchEngagementData();
    }, []);

    const fetchEngagementData = async () => {
        try {
            setLoadingEngagement(true);
            const response = await axios.get('/analytics/client-engagements');
            setEngagementData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching engagement data:', error);
            setEngagementData([]);
        } finally {
            setLoadingEngagement(false);
        }
    };

    const fetchScheduledBroadcasts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/broadcasts/scheduled');
            // Ensure we always set an array, even if the response is not an array
            const broadcasts = Array.isArray(response.data) ? response.data : [];
            setScheduledBroadcasts(broadcasts);
            // Reset pagination to first page when new data is loaded
            setCurrentBroadcastPage(0);
        } catch (error) {
            console.error('Error fetching scheduled broadcasts:', error);
            // Set empty array on error to prevent map errors
            setScheduledBroadcasts([]);
            setCurrentBroadcastPage(0);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (date - now) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffInHours < 48) {
            return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    };

    const nextUpdate = () => {
        setCurrentUpdate((prev) => (prev === updates.length - 1 ? 0 : prev + 1));
    };

    const prevUpdate = () => {
        setCurrentUpdate((prev) => (prev === 0 ? updates.length - 1 : prev - 1));
    };

    // Pagination logic for scheduled broadcasts
    const totalBroadcastPages = Math.ceil(scheduledBroadcasts.length / BROADCASTS_PER_PAGE);
    const currentBroadcasts = scheduledBroadcasts.slice(
        currentBroadcastPage * BROADCASTS_PER_PAGE,
        (currentBroadcastPage + 1) * BROADCASTS_PER_PAGE
    );

    const nextBroadcastPage = () => {
        setCurrentBroadcastPage((prev) => 
            prev === totalBroadcastPages - 1 ? 0 : prev + 1
        );
    };

    const prevBroadcastPage = () => {
        setCurrentBroadcastPage((prev) => 
            prev === 0 ? totalBroadcastPages - 1 : prev - 1
        );
    };

    // Prepare scatter plot data
    const getScatterPlotData = () => {
        return {
            datasets: [{
                label: 'Users',
                data: engagementData.map(user => ({
                    x: user.engagingTime || 0, // Engagement time in seconds
                    y: user.clicks || 0, // Click rate (using clicks as y-axis)
                    label: user.name || 'Unknown User'
                })),
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            }]
        };
    };

    const scatterPlotOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const dataPoint = context.raw;
                        return `${dataPoint.label}: ${Math.floor(dataPoint.x / 60)}m ${dataPoint.x % 60}s, ${dataPoint.y} clicks`;
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
                    text: 'Engagement Time (seconds)'
                },
                ticks: {
                    callback: function(value) {
                        const minutes = Math.floor(value / 60);
                        const seconds = value % 60;
                        return `${minutes}m ${seconds}s`;
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Click Rate'
                },
                beginAtZero: true
            }
        }
    };

    return (

        <div className="bg-gray-50 min-h-screen text-gray-900 font-sans px-4 sm:px-6 lg:px-8 pt-8 pb-12">
            < Navbar />
            {/* Welcome Header with animated gradient */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto mb-8"
            >
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%'
                        }}
                    />
                    <div className="relative z-10 p-6 text-white">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Yip Cheu Fong</h1>
                        <p className="text-blue-100 opacity-90">Here's what's happening with your business today</p>
                    </div>
                </div>
            </motion.div>

    


    {/* Dashboard Metrics */ }
    < div className = "max-w-7xl mx-auto" >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* User Engagement Scatter Plot */}
        <motion.div
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
        >
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">User Engagement Analysis</h2>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            <span className="h-2 w-2 bg-indigo-600 rounded-full mr-2"></span>
                            Live Data
                        </div>
                        <button
                            onClick={fetchEngagementData}
                            disabled={loadingEngagement}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                            aria-label="Refresh data"
                        >
                            <RefreshCw className={`h-4 w-4 text-gray-700 ${loadingEngagement ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
                <div className="relative h-64">
                    {loadingEngagement ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : engagementData.length > 0 ? (
                        <Scatter data={getScatterPlotData()} options={scatterPlotOptions} />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Users className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-gray-500 text-sm">No engagement data available</p>
                            <p className="text-gray-400 text-xs">Click refresh to load data</p>
                        </div>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500">Total Users</p>
                            <p className="text-lg font-semibold text-gray-900">{engagementData.length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Avg. Engagement</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {engagementData.length > 0 
                                    ? `${Math.floor(engagementData.reduce((sum, user) => sum + (user.engagingTime || 0), 0) / engagementData.length / 60)}m`
                                    : '0m'
                                }
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Clicks</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {engagementData.reduce((sum, user) => sum + (user.clicks || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

    {/* Today's Summary */ }
    < motion.div
className = "bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
initial = {{ opacity: 0, y: 20 }}
animate = {{ opacity: 1, y: 0 }}
transition = {{ duration: 0.5, delay: 0.1 }}
whileHover = {{ y: -5 }}
          >
    <div className="p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Summary</h2>
            <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>12 July 2025</span>
            </div>
        </div>

        <div className="space-y-4">
  {todaysEvents.length > 0 ? (
    todaysEvents.map((ev) => {
      // Color accents by type (matches your demo palette vibe)
      const typeBg = {
        Broadcast: { tile: 'bg-indigo-50', icon: 'bg-indigo-100', iconTint: 'text-indigo-600' },
        Consultation: { tile: 'bg-blue-50', icon: 'bg-blue-100', iconTint: 'text-blue-600' },
        Sales: { tile: 'bg-yellow-50', icon: 'bg-yellow-100', iconTint: 'text-yellow-700' },
        Service: { tile: 'bg-purple-50', icon: 'bg-purple-100', iconTint: 'text-purple-600' },
        'Policy-updates': { tile: 'bg-red-50', icon: 'bg-red-100', iconTint: 'text-red-600' },
      }[ev.type] || { tile: 'bg-gray-50', icon: 'bg-gray-100', iconTint: 'text-gray-600' };

      // Build time label
      const timeLabel =
        ev.startTime && ev.endTime
          ? `${ev.startTime} – ${ev.endTime}`
          : ev.startTime || 'All day';

      // Optional “mins remaining” if event is currently ongoing
      let extra = null;
      const now = new Date();
      const nowStr = ymd(now);

      const nowMins = now.getHours() * 60 + now.getMinutes();
      const s = timeToMinutes(ev.startTime);
      const e = timeToMinutes(ev.endTime);

      if (s != null && e != null && nowStr === todayStr) {
        if (nowMins < s) {
          extra = `${s - nowMins} mins to start`;
        } else if (nowMins >= s && nowMins <= e) {
          extra = `${e - nowMins} mins remaining`;
        } else {
          extra = 'Ended';
        }
      }

      // status badge
      const statusMap = {
        approved: 'bg-green-100 text-green-800',
        pending: 'bg-amber-100 text-amber-800',
        rejected: 'bg-red-100 text-red-800',
      };
      const statusBadge = statusMap[ev.status] || 'bg-gray-100 text-gray-700';

      return (
        <div key={ev._id} className={`flex items-start p-3 rounded-lg ${typeBg.tile}`}>
          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${typeBg.icon} flex items-center justify-center`}>
            <Calendar className={`h-5 w-5 ${typeBg.iconTint}`} />
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {ev.name || ev.title || ev.type}
              </p>
              <span className={`ml-3 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusBadge}`}>
                {ev.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="bg-white text-gray-700 border border-gray-200 text-xs px-2 py-0.5 rounded-full flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {timeLabel}
              </span>
              {ev.location && (
                <span className="bg-white text-gray-700 border border-gray-200 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {ev.location}
                </span>
              )}
              {extra && <span className="text-xs text-gray-500">{extra}</span>}
            </p>
          </div>
        </div>
      );
    })
  ) : (
    // Fallback (your existing placeholder)
    <div className="mt-4 h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
        className="z-10"
      >
        <LayoutDashboard className="h-12 w-12 text-blue-400" />
      </motion.div>
      <p className="ml-4 text-blue-600 z-10">No events today</p>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full filter blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-200 rounded-full filter blur-xl"></div>
      </div>
    </div>
  )}
</div>

    </div>
          </motion.div >
        </div >

    {/* Scheduled Broadcasts Section */}
    <section className="mb-16">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Send className="h-5 w-5 text-indigo-600 mr-2" />
                    Scheduled Broadcasts
                    {scheduledBroadcasts.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({scheduledBroadcasts.length} total)
                        </span>
                    )}
                </h2>
                <div className="flex items-center space-x-3">
                    {/* Pagination controls */}
                    {totalBroadcastPages > 1 && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={prevBroadcastPage}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="text-sm text-gray-600 px-2">
                                {currentBroadcastPage + 1} of {totalBroadcastPages}
                            </span>
                            <button
                                onClick={nextBroadcastPage}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={fetchScheduledBroadcasts}
                        disabled={loading}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <Link 
                        to="/broadcast" 
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors duration-200"
                    >
                        Manage broadcasts
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>
            </div>
            
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : Array.isArray(scheduledBroadcasts) && scheduledBroadcasts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentBroadcasts.map((broadcast, index) => (
                            <motion.div
                                key={broadcast._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                                whileHover={{ y: -2 }}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                                <Mail className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">
                                                    {broadcast.title || 'Untitled Broadcast'}
                                                </h3>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                    Email
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            broadcast.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                            broadcast.status === 'Sent' ? 'bg-green-100 text-green-800' :
                                            broadcast.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {broadcast.status}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="h-4 w-4 mr-2" />
                                            {formatDateTime(broadcast.scheduledTime)}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Users className="h-4 w-4 mr-2" />
                                            {broadcast.recipientCount || broadcast.broadcast?.recipients?.length || 0} recipients
                                        </div>
                                    </div>
                                    
                                    {broadcast.message && (
                                        <p className="text-sm text-gray-700 mb-3 overflow-hidden" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {broadcast.message.length > 80 
                                                ? `${broadcast.message.substring(0, 80)}...` 
                                                : broadcast.message
                                            }
                                        </p>
                                    )}
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            {broadcast.createdAt 
                                                ? `Created ${new Date(broadcast.createdAt).toLocaleDateString()}`
                                                : 'Recently created'
                                            }
                                        </span>
                                        <Link 
                                            to="/broadcast"
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-gray-100 rounded-full mb-4">
                                <Send className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Broadcasts</h3>
                            <p className="text-gray-600 mb-6">You don't have any broadcasts scheduled at the moment.</p>
                            <Link 
                                to="/broadcast"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Schedule Broadcast
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </section>


          {/* Dashboard Metrics */}
<div className="max-w-7xl mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
    {/* (left) User Engagement Analysis card ... */}
    {/* (right) Today's Summary card ... */}
  </div>

  {/* New Row: Drafts at a Glance */}
  <div className="grid grid-cols-1 gap-8 mb-12">
    <DraftsOverview />
  </div>
</div>

    {/* Upcoming Events Section */ }
    < section className = "mb-16" >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">UPCOMING EVENTS</h2>
           <Link 
  to="/secret-calendar" 
  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
>
  View all events
  <ArrowRight className="h-4 w-4 ml-1" />
</Link>
          </div>
          
          <NearEvents />
        </section >
      </div >


    </div >
  );
};

const EventCard = ({ title, date, time, location, notes, status }) => {
    const statusColors = {
        urgent: 'bg-red-100 text-red-800',
        upcoming: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800'
    };

return (
    <>
        <motion.div
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
        >
            <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent z-10"></div>
                <div className="absolute top-4 right-4 z-20">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
                    </span>
                </div>
                <Users className="h-12 w-12 text-indigo-400 z-10" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-200 rounded-full filter blur-xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200 rounded-full filter blur-xl"></div>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{date} {time && <>• {time}</>}</span>
                </div>
                {location && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{location}</span>
                    </div>
                )}
                <p className="text-sm text-gray-600 mb-4">{notes}</p>
                <div className="flex justify-between items-center">
                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                        More details
                        <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                    <div className="flex space-x-2">
                        <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                            <Phone className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                            <Mail className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    </>
);
};

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubscribed(true);
        setTimeout(() => {
            setSubscribed(false);
            setEmail('');
        }, 3000);
    };

    return (
        <motion.footer
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-950 text-gray-200 pt-16 pb-8 px-6"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="space-y-4"
                    >
                        <h3 className="text-white text-xl font-semibold pb-2 border-b border-indigo-800 inline-block">Financial Freedom</h3>
                        <p className="text-gray-400 text-sm">
                            Empowering your financial future with personalized strategies and expert guidance.
                        </p>
                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>123 Financial Ave, Singapore 123456</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>+65 88058250</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>yipchuefong@gmail.com</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-4"
                    >
                        <h3 className="text-white text-xl font-semibold pb-2 border-b border-indigo-800 inline-block">Quick Links</h3>
                        <ul className="space-y-2">
                            {["Dashboard", "Contacts", "Messages", "Calendar", "Reports"].map((item) => (
                                <motion.li
                                    key={item}
                                    whileHover={{ x: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition flex items-center"
                                    >
                                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                                        {item}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Resources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="space-y-4"
                    >
                        <h3 className="text-white text-xl font-semibold pb-2 border-b border-indigo-800 inline-block">Resources</h3>
                        <ul className="space-y-2">
                            {[
                                "Client Documents",
                                "Tax Forms",
                                "Policy Templates",
                                "Training Materials",
                                "Compliance Guides"
                            ].map((resource) => (
                                <motion.li
                                    key={resource}
                                    whileHover={{ x: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition flex items-center"
                                    >
                                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                                        {resource}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Copyright */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="border-t border-indigo-800 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
                >
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                        </svg>
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} Financial Freedom. All rights reserved.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        {['Privacy Policy', 'Terms of Service', 'Disclaimer', 'Sitemap'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-xs text-gray-500 hover:text-white transition hover:underline"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-xs text-gray-600">
                            Registered Financial Advisor • MAS License No: ABC123456
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default AdminHomePage;