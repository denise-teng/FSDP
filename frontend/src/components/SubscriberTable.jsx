import { motion } from 'framer-motion';
import { FiTrash2, FiUser, FiCalendar, FiAtSign } from 'react-icons/fi';

const SubscribersTable = ({
  subscribers,
  loading,
  error,
  searchTerm,
  onRetry,
  onRemoveSubscriber,
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
    hover: { scale: 1.005, boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' },
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-red-800">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={onRetry}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (subscribers.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={emptyStateVariants}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-8 text-center"
      >
        <div className="mx-auto h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <FiUser className="h-12 w-12 text-indigo-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {searchTerm ? 'No matching subscribers found' : 'No subscribers yet'}
        </h3>
        <p className="text-gray-500">
          {searchTerm
            ? 'Try adjusting your search or filter criteria'
            : 'Subscribers will appear here once they sign up'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiUser className="mr-2" />
                  Name
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiAtSign className="mr-2" />
                  Email
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  Joined Date
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscribers.map((subscriber, index) => (
              <motion.tr
                key={`${subscriber.email}-${index}`}
                variants={rowVariants}
                whileHover="hover"
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.firstName || 'Unknown'} {subscriber.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{subscriber.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{subscriber.joinedDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                    {subscriber.source}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onRemoveSubscriber(subscriber.email)}
                    className="text-red-600 hover:text-red-900 flex items-center justify-end w-full"
                  >
                    <FiTrash2 className="mr-1" /> Remove
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SubscribersTable;