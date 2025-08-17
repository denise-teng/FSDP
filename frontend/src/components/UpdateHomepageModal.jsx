import React, { useState, useEffect } from 'react';
import { useNewsletterStore } from "../stores/useNewsletterStore";
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const UpdateHomepageModal = () => {
  const {
    newsletters,
    homepageSlots,
    fetchNewsletters,
    initializeSlots,
    updateHomepageSlot
  } = useNewsletterStore();

  const [viewMode, setViewMode] = useState('slots');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


const getFileUrl = (path) => {
  if (!path) return '/placeholder-thumbnail.jpg';

  const cleanPath = String(path)
    .replace(/^[\\/]+/, '')
    .replace(/\\/g, '/')
    .replace(/^uploads\//, '');

  return `http://localhost:5000/uploads/${cleanPath}`;
};

const getImageUrl = (path) => {
  if (!path) return '/placeholder-image.jpg';
  
  // Handle different path formats
  if (path.startsWith('http')) return path;
  if (path.startsWith('/images/')) return path;
  
  // Handle uploaded files
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
      toast.success(`Slot ${slotIndex + 1} updated successfully!`);
      setViewMode('slots');
      console.log('Selecting slot', slotIndex, 'newsletterId', newsletter._id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update slot');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading && !homepageSlots.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 w-full max-w-6xl mx-auto">
      {viewMode === 'slots' ? (
        <div>
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Homepage Slots
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((slotIndex) => (
              <motion.div
                key={slotIndex}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer border-2 ${homepageSlots[slotIndex] ? 'border-indigo-100' : 'border-dashed border-gray-300'
                  } flex flex-col h-full transition-all duration-300 hover:shadow-md`}
                onClick={() => {
                  setSelectedSlot(slotIndex);
                  setViewMode('newsletters');
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  {homepageSlots[slotIndex] ? (
                    <>
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-gray-50 to-indigo-50 mb-4 overflow-hidden">
                        <img
                          src={getFileUrl(homepageSlots[slotIndex]?.thumbnailPath)}
                          className="w-full h-full object-cover"
                          alt="Current newsletter"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-thumbnail.jpg';
                          }}
                        />
                      </div>
                      <h3 className="font-medium text-gray-800 text-center">
                        {homepageSlots[slotIndex]?.title || 'Untitled Newsletter'}
                      </h3>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="text-gray-500">Slot {slotIndex + 1}</span>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                  <span className="text-sm font-medium text-indigo-600">
                    {homepageSlots[slotIndex] ? 'Click to Change' : 'Click to Select'}
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
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Slots
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Select Newsletter for <span className="text-indigo-600">Slot {selectedSlot + 1}</span>
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletters.map((newsletter) => (
                <motion.div
                  key={newsletter._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer border border-gray-200 hover:border-indigo-200 transition-all"
                  onClick={() => handleSlotSelect(selectedSlot, newsletter)}
                >
                  <div className="h-48 bg-gradient-to-br from-gray-50 to-indigo-50 overflow-hidden">
                    <img
                      src={getFileUrl(newsletter.thumbnailPath)}
                      alt={newsletter.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-newsletter.jpg';
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {newsletter.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                      {newsletter.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateHomepageModal;
