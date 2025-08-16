import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SubscribersTable from '../components/SubscriberTable';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FiUsers, FiMail, FiRefreshCw, FiSearch, FiFilter, FiX } from 'react-icons/fi';

const ViewSubscriberPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/subscribe');

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Invalid response format');
      }

      const formattedData = response.data.data.map(sub => ({
        email: sub.email,
        joinedDate: format(new Date(sub.subscribedAt), 'MMM dd, yyyy'),
        joinedAt: new Date(sub.subscribedAt).getTime(),
        firstName: sub.firstName || '',
        lastName: sub.lastName || '',
        source: sub.source || 'website'
      }));

      setSubscribers(formattedData);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load subscribers');
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscriber = async (email) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/subscribe/${encodeURIComponent(email)}`
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Subscriber removed successfully', {
          position: 'bottom-right',
          style: {
            background: '#4f46e5',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4f46e5',
          },
        });
        fetchSubscribers();
      } else {
        toast.error(response.data.message || 'Failed to remove subscriber');
      }
    } catch (error) {
      console.error('Error removing subscriber:', error);
      toast.error(error.response?.data?.message || 'Failed to remove subscriber');
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter((sub) => {
    const emailMatch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!emailMatch) return false;

    if (!fromDate && !toDate) return true;
    const t = sub.joinedAt;
    const fromOk = fromDate ? t >= new Date(fromDate).setHours(0, 0, 0, 0) : true;
    const toOk = toDate ? t <= new Date(toDate).setHours(23, 59, 59, 999) : true;
    return fromOk && toOk;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 sm:mb-10 overflow-hidden"
        >
          {/* Decorative Elements */}
          <motion.div 
            animate={{ 
              x: [0, 5, 0],
              y: [0, -5, 0],
              rotate: [0, 2, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"
          ></motion.div>
          <motion.div 
            animate={{ 
              x: [0, -5, 0],
              y: [0, 5, 0],
              rotate: [0, -2, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 10,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"
          ></motion.div>

          {/* Header Content */}
          <motion.div 
            variants={itemVariants}
            className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                ✨ Subscriber Management
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">View and manage your newsletter subscribers</p>
            </div>

            {/* Animated Icon Container */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative self-center sm:self-auto"
            >
              <div className="h-14 sm:h-16 w-14 sm:w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <FiUsers className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-5 sm:h-6 w-5 sm:w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse flex items-center justify-center">
                <FiMail className="text-xs font-bold text-white" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Content Area */}
        <motion.div variants={containerVariants} className="space-y-4">
          {/* Search and Stats Bar */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <motion.input
                type="text"
                placeholder="Search subscribers..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <motion.button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl shadow hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiFilter className="mr-2" />
                Filter
              </motion.button>

              <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex-1 md:flex-none">
                <p className="text-sm text-indigo-600">Total Subscribers</p>
                <p className="text-xl font-bold text-indigo-800">{subscribers.length}</p>
              </div>

              <motion.button
                onClick={fetchSubscribers}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl shadow hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
            </div>
          </motion.div>

          {(fromDate || toDate) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {fromDate ? `From: ${fromDate}` : 'From: —'} • {toDate ? `To: ${toDate}` : 'To: —'}
              </span>
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="text-xs text-indigo-600 hover:underline flex items-center"
              >
                <FiX className="mr-1" /> Clear
              </button>
            </motion.div>
          )}

          {/* Filter Modal */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                  onClick={() => setIsFilterOpen(false)}
                />

                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 z-10"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Filter by Date</h3>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">From</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">To</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <motion.button
                      onClick={() => { setFromDate(''); setToDate(''); }}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Clear
                    </motion.button>
                    <motion.button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Apply
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-red-800">Error</p>
                  <p className="text-red-600">{error}</p>
                </div>
                <motion.button
                  onClick={fetchSubscribers}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Retry
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Subscribers Table */}
          <motion.div variants={itemVariants}>
            <SubscribersTable
              subscribers={filteredSubscribers}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              onRetry={fetchSubscribers}
              onRemoveSubscriber={handleRemoveSubscriber}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ViewSubscriberPage;