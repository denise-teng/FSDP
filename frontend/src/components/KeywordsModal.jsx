import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const KeywordsModal = ({ isOpen, onClose }) => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchKeywords();
    }
  }, [isOpen]);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/keywords');
      console.log('Keywords response:', response.data);
      setKeywords(response.data || []);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      toast.error('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error('Keyword is required');
      return;
    }

    try {
      console.log('Adding keyword to database:', newKeyword.trim());
      const response = await axios.post('/keywords', {
        keyword: newKeyword.trim()
      });
      
      console.log('Add keyword response:', response.data);
      setKeywords([response.data.keyword, ...keywords]);
      setNewKeyword('');
      toast.success('Keyword added successfully');
    } catch (error) {
      console.error('Error adding keyword:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to add keyword');
    }
  };

  const handleDeleteKeyword = async (keywordId) => {
    if (!confirm('Are you sure you want to delete this keyword?')) {
      return;
    }

    try {
      console.log('Deleting keyword with ID:', keywordId);
      setKeywords(keywords.filter(k => k.keywordId !== keywordId));
      toast.success('Keyword deleted successfully');
    } catch (error) {
      console.error('Error deleting keyword:', error);
      toast.error('Failed to delete keyword');
    }
  };

  const handleToggleStatus = async (keywordId) => {
    try {
      console.log('Toggling status for keyword ID:', keywordId);
      
      // Find the keyword to get current status
      const keyword = keywords.find(k => k.keywordId === keywordId);
      if (!keyword) return;

      // Make API call to update in database
      const response = await axios.put(`/keywords/${keywordId}/toggle`);
      
      if (response.data.success) {
        // Update local state
        setKeywords(keywords.map(k => 
          k.keywordId === keywordId 
            ? { ...k, isActive: !k.isActive }
            : k
        ));
        toast.success(`Keyword ${!keyword.isActive ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      console.error('Error toggling keyword status:', error);
      toast.error('Failed to update keyword status');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🔑 Keywords Management</h2>
              <p className="text-purple-100 mt-1">Manage keywords for potential client detection</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 hover:bg-white/10 p-2 rounded-full transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Add New Keyword Form */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">➕ Add New Keyword</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder="e.g., urgent, meeting, schedule"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddKeyword}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Keyword
                </button>
              </div>
            </div>
          </div>

          {/* Keywords List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Current Keywords</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading keywords...</p>
              </div>
            ) : keywords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No keywords added yet.</p>
                <p className="text-sm">Start by adding your first keyword above!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {keywords.map((keyword) => (
                  <div
                    key={keyword.keywordId}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      keyword.isActive 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            keyword.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {keyword.keyword}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            keyword.isActive 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {keyword.isActive ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(keyword.keywordId)}
                          className={`p-2 rounded-lg transition-colors ${
                            keyword.isActive 
                              ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                              : 'bg-green-100 hover:bg-green-200 text-green-600'
                          }`}
                          title={keyword.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <span className="text-xs font-bold">
                            {keyword.isActive ? 'OFF' : 'ON'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteKeyword(keyword.keywordId)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordsModal;
