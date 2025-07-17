import React, { useState, useEffect } from 'react';
import { useNewsletterStore } from "../stores/useNewsletterStore";
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axios';  // Import the axiosInstance

const UpdateHomepageModal = ({ isOpen, onClose, newNewsletter, isLoading }) => {
  if (!isOpen) return null; // Don't render modal if it's not open

  const { newsletters, homepageSlots, updateHomepageSlot } = useNewsletterStore();
  const [viewMode, setViewMode] = useState('slots');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle tags (checking if it's a string and converting it into an array)
  const handleTags = (tags) => {
    if (Array.isArray(tags)) {
      return tags.map(tag => tag.trim()); // If it's already an array, trim any whitespace
    } else if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()); // If it's a string, split by commas
    }
    return []; // Return an empty array if neither condition is met
  };

const getFileUrl = (path) => {
  if (!path) {
    console.warn("No path provided");
    return null;
  }

  const cleanPath = String(path)
    .replace(/^[\\/]+/, '')  // Remove leading slashes/backslashes
    .replace(/\\/g, '/')    // Replace backslashes with forward slashes
    .replace(/^uploads\//, ''); // Remove the "uploads/" prefix, if it exists

  // Force using port 5000 in the backend URL (change the base URL as needed)
  const baseUrl = 'http://localhost:5000';  // Force using port 5000

  return `${baseUrl}/uploads/${cleanPath}`;  // Ensure the image path points to the backend
};


const handleSlotSelect = async (slotIndex, newsletter) => {
  try {
    // Use the axiosInstance here to make the POST request
    const response = await axiosInstance.post('/homepage/slots', { slots: newsletter });
    console.log('Response:', response.data); // Handle the successful response

    // Update the homepageSlots state with the new slot data
    useNewsletterStore.setState((state) => {
      const updatedSlots = [...state.homepageSlots];
      updatedSlots[slotIndex] = newsletter; // Update the specific slot
      return { homepageSlots: updatedSlots };
    });

    // Persist updated slots to localStorage
    localStorage.setItem('homepageSlots', JSON.stringify(newsletter));

    setSuccessMessage(`Successfully placed in Slot ${slotIndex + 1}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      setViewMode('slots');
    }, 1000);

  } catch (error) {
    console.error('Error saving slots:', error.response?.data || error.message);
    toast.error("Failed to update slot");
  }
};



  // Load slot data from localStorage on page reload
  useEffect(() => {
    const savedSlots = JSON.parse(localStorage.getItem('homepageSlots'));
    if (savedSlots) {
      // Set the loaded slots into state
      savedSlots.forEach((slot, index) => {
        if (slot) homepageSlots[index] = slot;  // Load saved slots into state
      });
    }
  }, []);  // Empty dependency array to only run on component mount

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-2">
          {/* Close button (X) */}
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
            aria-label="Close Modal"
          >
            &times; {/* This is the X icon */}
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg">Uploading your newsletter...</p>
            </div>
          ) : successMessage ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                {successMessage}
              </div>
            </div>
          ) : viewMode === 'slots' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[0, 1, 2].map((slotIndex) => (
                <motion.div
                  key={slotIndex}
                  whileHover={{ scale: 1.03 }}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border-2 ${
                    homepageSlots[slotIndex] ? 'border-gray-200' : 'border-dashed border-gray-400'
                  } min-h-[200px] flex flex-col`}
                  onClick={() => {
                    if (newNewsletter) {
                      handleSlotSelect(slotIndex, newNewsletter);
                    } else {
                      setSelectedSlot(slotIndex); // Update selected slot
                      setViewMode('newsletters'); // Switch to newsletters view
                    }
                  }}
                >
                  <div className="flex-1 flex items-center justify-center p-4">
                    {homepageSlots[slotIndex] ? (
                      <div className="text-center">
                        <img
                          src={getFileUrl(homepageSlots[slotIndex].thumbnailPath) || '/placeholder-thumbnail.jpg'}
                          className="w-20 h-20 object-cover mx-auto mb-2 rounded"
                          alt="Current newsletter"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-thumbnail.jpg';
                          }}
                        />
                        <h3 className="font-medium text-sm text-black">
                          {homepageSlots[slotIndex].title}
                        </h3>
                      </div>
                    ) : (
                      <span className="text-gray-500">Slot {slotIndex + 1}</span>
                    )}
                  </div>
                  <div className="bg-gray-100 p-2 text-center">
                    <span className={`text-sm font-medium ${newNewsletter ? 'text-blue-600' : 'text-gray-800'}`}>
                      {newNewsletter ? 'Click to Place' : 'Click to Choose'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold">Select Newsletter for Slot {selectedSlot + 1}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsletters.map((newsletter) => (
                  <motion.div
                    key={newsletter._id}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border border-gray-200"
                    onClick={() => handleSlotSelect(selectedSlot, newsletter)}
                  >
                    <img
                      src={getFileUrl(newsletter.thumbnailPath) || '/default-newsletter.jpg'}
                      alt={newsletter.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-newsletter.jpg';
                      }}
                    />
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {handleTags(newsletter.tags)?.map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-black">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-bold text-lg uppercase text-black">{newsletter.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateHomepageModal;
