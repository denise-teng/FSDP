import { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

// Remove Confirmation Modal Component
const RemoveConfirmationModal = ({ isOpen, onClose, onConfirm, recipientName, groupName, isFromMultipleGroups }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isFromMultipleGroups ? 'Remove from Group' : 'Remove Recipient'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {isFromMultipleGroups 
              ? `Are you sure you want to remove "${recipientName}" from the "${groupName}" group?`
              : `Are you sure you want to remove "${recipientName}"? This action cannot be undone.`
            }
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Group Selection Modal Component
const GroupSelectionModal = ({ isOpen, onClose, onSelectGroup, recipientName, groups }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Group to Remove From</h3>
          <p className="text-sm text-gray-500 mb-6">
            "{recipientName}" is in multiple groups. Which group would you like to remove them from?
          </p>
          <div className="space-y-2 mb-6">
            {groups.map((group, index) => (
              <button
                key={index}
                onClick={() => onSelectGroup(group)}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                <span className="font-medium text-gray-900">{group}</span>
              </button>
            ))}
          </div>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelectGroup('all')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Remove from All Groups
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BroadcastRecipientsModal({ onClose, selectedBroadcast, recipients: propRecipients }) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recipientsPerPage = 10;

  // Remove functionality state
  const [showGroupSelection, setShowGroupSelection] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [recipientToRemove, setRecipientToRemove] = useState(null);
  const [selectedGroupForRemoval, setSelectedGroupForRemoval] = useState(null);

  useEffect(() => {
    if (propRecipients) {
      // Add auto-generated IDs if they don't exist
      const recipientsWithIds = propRecipients.map((recipient, index) => ({
        ...recipient,
        contactId: recipient.contactId || (index + 1)
      }));
      setRecipients(recipientsWithIds);
    } else {
      fetchAllRecipients();
    }
  }, [propRecipients]);

  const fetchAllRecipients = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/broadcasts/recipients');
      console.log('✅ Fetched recipients:', res.data);
      
      // Add auto-generated IDs if they don't exist
      const recipientsWithIds = res.data.map((recipient, index) => ({
        ...recipient,
        contactId: recipient.contactId || (index + 1)
      }));
      
      setRecipients(recipientsWithIds);
    } catch (err) {
      console.error('❌ Failed to fetch recipients:', err);
      toast.error('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipient = async (recipient) => {
    setRecipientToRemove(recipient);
    
    // Check if recipient is in multiple groups
    if (recipient.broadcastGroup && recipient.broadcastGroup.includes(', ')) {
      const groups = recipient.broadcastGroup.split(', ').filter(group => group.trim() !== '');
      if (groups.length > 1) {
        setShowGroupSelection(true);
        return;
      }
    }
    
    // If only in one group or no groups, show confirmation directly
    setSelectedGroupForRemoval(recipient.broadcastGroup || null);
    setShowRemoveConfirmation(true);
  };

  const handleGroupSelection = (groupName) => {
    setShowGroupSelection(false);
    setSelectedGroupForRemoval(groupName);
    setShowRemoveConfirmation(true);
  };

  const handleRemoveConfirmation = async () => {
    try {
      if (!recipientToRemove) return;

      const recipientId = recipientToRemove._id;
      const isFromMultipleGroups = recipientToRemove.broadcastGroup && recipientToRemove.broadcastGroup.includes(', ');

      if (selectedGroupForRemoval === 'all' || !isFromMultipleGroups) {
        // Remove recipient from all groups
        await axios.delete(`/broadcasts/recipients/${recipientId}`);
        setRecipients(prev => prev.filter(r => r._id !== recipientId));
        toast.success(`${recipientToRemove.firstName} ${recipientToRemove.lastName} has been removed from all groups`);
      } else {
        // Remove from specific group only
        const encodedGroupName = encodeURIComponent(selectedGroupForRemoval);
        await axios.delete(`/broadcasts/recipients/${recipientId}/group/${encodedGroupName}`);
        
        const currentGroups = recipientToRemove.broadcastGroup.split(', ');
        const updatedGroups = currentGroups.filter(group => group !== selectedGroupForRemoval);
        
        const updatedRecipient = {
          ...recipientToRemove,
          broadcastGroup: updatedGroups.length > 0 ? updatedGroups.join(', ') : ''
        };

        // Update the local state
        setRecipients(prev => prev.map(r => 
          r._id === recipientId ? updatedRecipient : r
        ));
        
        toast.success(`${recipientToRemove.firstName} ${recipientToRemove.lastName} has been removed from "${selectedGroupForRemoval}"`);
      }

      // Reset state
      setShowRemoveConfirmation(false);
      setRecipientToRemove(null);
      setSelectedGroupForRemoval(null);
      
    } catch (error) {
      console.error('Failed to remove recipient:', error);
      toast.error('Failed to remove recipient');
    }
  };

  const handleCloseModals = () => {
    setShowGroupSelection(false);
    setShowRemoveConfirmation(false);
    setRecipientToRemove(null);
    setSelectedGroupForRemoval(null);
  };

  // Filter recipients based on search
  const filteredRecipients = recipients.filter(recipient => 
    recipient.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    recipient.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    recipient.email?.toLowerCase().includes(search.toLowerCase()) ||
    recipient.phone?.includes(search) ||
    recipient.broadcastGroup?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastRecipient = currentPage * recipientsPerPage;
  const indexOfFirstRecipient = indexOfLastRecipient - recipientsPerPage;
  const currentRecipients = filteredRecipients.slice(indexOfFirstRecipient, indexOfLastRecipient);
  const totalPages = Math.ceil(filteredRecipients.length / recipientsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedBroadcast ? `${selectedBroadcast.title} Recipients` : 'Viewing All Recipients'}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {selectedBroadcast 
                    ? `${filteredRecipients.length} recipients in this broadcast` 
                    : `${filteredRecipients.length} total recipients across all broadcasts`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-200 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, phone, or broadcast group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Page {currentPage} of {totalPages}</span>
              <span>•</span>
              <span>{filteredRecipients.length} recipients</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading recipients...</span>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">First Name</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">Last Name</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">
                      {selectedBroadcast ? 'Channel' : 'Broadcast Group(s)'}
                    </th>
                    {!selectedBroadcast && <th className="p-4 text-center text-sm font-semibold text-gray-900">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentRecipients.length > 0 ? (
                    currentRecipients.map((r, index) => (
                      <tr key={r._id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300">
                        
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {r.firstName || '—'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {r.lastName || '—'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-sm text-gray-700 bg-gray-50 rounded px-2 py-1 inline-block">
                            {r.phone || 'No phone'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-700">
                            {r.email || 'No email'}
                          </div>
                        </td>
                        <td className="p-4">
                          {selectedBroadcast ? (
                            // Show channel for specific broadcast
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              r.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                              r.channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.channel ? r.channel.charAt(0).toUpperCase() + r.channel.slice(1) : 'No channel'}
                            </span>
                          ) : (
                            // Show broadcast groups for "View All"
                            <div className="flex flex-wrap gap-1">
                              {r.broadcastGroup ? (
                                r.broadcastGroup.split(', ').map((group, groupIndex) => (
                                  <span key={groupIndex} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {group}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">No groups</span>
                              )}
                            </div>
                          )}
                        </td>
                        
                        {!selectedBroadcast && (
                          <td className="p-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                onClick={() => deleteRecipient(r)}
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={selectedBroadcast ? "5" : "6"} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-lg font-medium text-gray-500">No recipients found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {search ? 'Try adjusting your search criteria' : 'This broadcast has no recipients yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstRecipient + 1} to {Math.min(indexOfLastRecipient, filteredRecipients.length)} of {filteredRecipients.length} recipients
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      currentPage === index + 1
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Group Selection Modal */}
      <GroupSelectionModal
        isOpen={showGroupSelection}
        onClose={handleCloseModals}
        onSelectGroup={handleGroupSelection}
        recipientName={recipientToRemove ? `${recipientToRemove.firstName} ${recipientToRemove.lastName}` : ''}
        groups={recipientToRemove?.broadcastGroup ? recipientToRemove.broadcastGroup.split(', ').filter(group => group.trim() !== '') : []}
      />

      {/* Remove Confirmation Modal */}
      <RemoveConfirmationModal
        isOpen={showRemoveConfirmation}
        onClose={handleCloseModals}
        onConfirm={handleRemoveConfirmation}
        recipientName={recipientToRemove ? `${recipientToRemove.firstName} ${recipientToRemove.lastName}` : ''}
        groupName={selectedGroupForRemoval}
        isFromMultipleGroups={recipientToRemove?.broadcastGroup ? recipientToRemove.broadcastGroup.includes(', ') : false}
      />
    </div>
  );
}
