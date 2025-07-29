import { useState } from 'react';
import { motion } from 'framer-motion';
import GenerateMessagePage from './GenerateMessagePage';  // Assuming this is the page for generating messages
import EditNewsletterPage from './EditNewsletterPage';  // Assuming this is the page for editing newsletters
import UploadNewsletter from './UploadNewsletter';  // Assuming this is the page for uploading newsletters
import DraftPage from './DraftsPage';  // Assuming this is the page for drafts
import EditHomeSlotPage from './EditHomeSlotPage';  // Assuming this is the page for editing the homepage slot
import EnhanceNewsletterPage from "../components/EnhanceNewsletterPage";

const ContentGenerationPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('generate'); // Default to 'generate'

const renderSubTab = () => {
    switch (activeSubTab) {
      case 'generate':
        return <GenerateMessagePage />;
      case 'uploadNewsletter':
        return <UploadNewsletter />;
      case 'drafts':
        return <DraftPage />;
      case 'editHomeSlot':
        return <EditHomeSlotPage />;
      case 'enhanceNewsletter': 
        return <EnhanceNewsletterPage />;
      default:
        return <GenerateMessagePage />;
    }
  };

    const getFileUrl = (path) => {
    if (!path) {
      console.warn("No path provided");
      return null;
    }

    const cleanPath = String(path)
      .replace(/^[\\/]+/, '')  // Remove leading slashes/backslashes
      .replace(/\\/g, '/')    // Replace backslashes with forward slashes
      .replace(/^uploads\//, ''); // Remove the "uploads/" prefix if it exists

    const baseUrl = 'http://localhost:5000'; // Your backend URL
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex justify-center gap-4 mb-6">
        <motion.button
          onClick={() => setActiveSubTab('generate')}
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'generate'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }} // Hover effect to scale up the button
        >
          Generate
        </motion.button>
        <motion.button
          onClick={() => setActiveSubTab('uploadNewsletter')}
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'uploadNewsletter'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          Upload Newsletter
        </motion.button>
                <motion.button
          onClick={() => setActiveSubTab('enhanceNewsletter')}  // New button for enhancement
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'enhanceNewsletter'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          Enhance Newsletter
        </motion.button>
        <motion.button
          onClick={() => setActiveSubTab('drafts')}
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'drafts'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          Drafts
        </motion.button>
        <motion.button
          onClick={() => setActiveSubTab('editHomeSlot')}
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'editHomeSlot'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          Edit HomeSlot
        </motion.button>
      </div>

      {/* Tab content */}
      <div className="mb-6">
        {renderSubTab()}
      </div>
    </div>
  );
};

export default ContentGenerationPage;
