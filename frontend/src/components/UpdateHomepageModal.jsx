import React, { useState, useEffect } from 'react';
import { useNewsletterStore } from "../stores/useNewsletterStore";
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axios';

const UpdateHomepageModal = () => {
  // Properly access store data and actions
  const { 
    newsletters, 
    homepageSlots, 
    fetchNewsletters,
    initializeSlots,
    updateHomepageSlot 
  } = useNewsletterStore();
  
  const [viewMode, setViewMode] = useState('slots');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get file URLs
  const getFileUrl = (path) => {
    if (!path) {
      console.warn("No path provided");
      return '/placeholder-thumbnail.jpg';
    }

    const cleanPath = String(path)
      .replace(/^[\\/]+/, '')
      .replace(/\\/g, '/')
      .replace(/^uploads\//, '');

    return `http://localhost:5000/uploads/${cleanPath}`;
  };

const handleSlotSelect = async (slotIndex, newsletter) => {
  setIsLoading(true);
  try {
    await updateHomepageSlot(slotIndex, newsletter);
    
    // Update local state
    useNewsletterStore.setState(state => {
      const updatedSlots = [...state.homepageSlots];
      updatedSlots[slotIndex] = newsletter;
      return { homepageSlots: updatedSlots };
    });

    setSuccessMessage(`Successfully updated slot ${slotIndex + 1}!`);
    setTimeout(() => setSuccessMessage(null), 1000);
    
  } catch (error) {
    toast.error(error.response?.data?.error || 'Failed to update slot');
  } finally {
    setIsLoading(false);
  }
};

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchNewsletters();
        await initializeSlots();
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchNewsletters, initializeSlots]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full">
      {successMessage && (
        <div className="mb-6 bg-green-100 text-green-800 p-4 rounded-lg text-center">
          {successMessage}
        </div>
      )}

      {viewMode === 'slots' ? (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Homepage Slots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[0, 1, 2].map((slotIndex) => (
              <motion.div
                key={slotIndex}
                whileHover={{ scale: 1.03 }}
                className={`bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer border-2 ${
                  homepageSlots[slotIndex] ? 'border-gray-600' : 'border-dashed border-gray-500'
                } min-h-[200px] flex flex-col`}
                onClick={() => {
                  setSelectedSlot(slotIndex);
                  setViewMode('newsletters');
                }}
              >
                <div className="flex-1 flex items-center justify-center p-4">
                  {homepageSlots[slotIndex] ? (
                    <div className="text-center">
                      <img
                        src={getFileUrl(homepageSlots[slotIndex]?.thumbnailPath)}
                        className="w-20 h-20 object-cover mx-auto mb-2 rounded"
                        alt="Current newsletter"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-thumbnail.jpg';
                        }}
                      />
                      <h3 className="font-medium text-sm text-white">
                        {homepageSlots[slotIndex]?.title || 'Untitled Newsletter'}
                      </h3>
                    </div>
                  ) : (
                    <span className="text-gray-400">Slot {slotIndex + 1}</span>
                  )}
                </div>
                <div className="bg-gray-600 p-2 text-center">
                  <span className="text-sm font-medium text-gray-300">
                    Click to Choose
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button 
            onClick={() => setViewMode('slots')}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            ← Back to Slots
          </button>
          
          <h2 className="text-2xl font-bold mb-6 text-white">
            Select Newsletter for Slot {selectedSlot + 1}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsletters.map((newsletter) => (
              <motion.div
                key={newsletter._id}
                whileHover={{ scale: 1.03 }}
                className="bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer border border-gray-600"
                onClick={() => handleSlotSelect(selectedSlot, newsletter)}
              >
                <img
                  src={getFileUrl(newsletter.thumbnailPath)}
                  alt={newsletter.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-newsletter.jpg';
                  }}
                />
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newsletter.tags?.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-600 px-2 py-1 rounded-full text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-lg uppercase text-white">
                    {newsletter.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateHomepageModal;